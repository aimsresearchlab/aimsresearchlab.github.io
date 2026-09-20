#!/usr/bin/env python3
"""Extract the TIAP walkthrough's data from the paper repo.

The /tiap page animates one real query (LongMemEval-S q380) rescored under the
Raw, Source and Canonical targets. Every number it shows comes from this
script, never from retyping: it reads the saved run artifacts in the paper
repo, writes public/tiap/data/tiap-case.json, and then verifies that each
number embedded in public/tiap/index.html appears in that JSON.

Usage:
    python3 scripts/sync-tiap-data.py [--paper-repo PATH] [--check]

    --check   verify index.html against the existing JSON without rewriting it

Upstream source of truth:
    <paper-repo>/MTEL-Mem/artifacts/runs/longmemeval/<run>/trace.jsonl.gz
    <paper-repo>/MTEL-Mem/artifacts/runs/longmemeval/<run>/target_rescore.json
    <paper-repo>/data/all_audit_cases.csv
    <paper-repo>/data/full_audit_*/judged_cases.csv
    <paper-repo>/data/target_sizes.csv
"""

from __future__ import annotations

import argparse
import collections
import csv
import gzip
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
OUT_JSON = SITE / "public" / "tiap" / "data" / "tiap-case.json"
PAGE = SITE / "public" / "tiap" / "index.html"

DEFAULT_PAPER_REPO = Path.home() / "Documents" / "research" / "LLM_Conversational_Memory__Sugam_"

# The exemplar. Chosen because it is the clearest instance of the paper's
# claim: raw misses outright, the credited descendant is about newspapers
# rather than National Geographic, and the two systems swap places when only
# the credited target changes.
QUERY_INDEX = 380
DATASET = "LongMemEval-S"
# The pair whose winner flips between Source and Canonical.
SYSTEM_A = "longmemeval_allminilm"
SYSTEM_B = "longmemeval_bge_m3"
# The contrast system: same query, credits the memory that actually answers it.
SYSTEM_C = "longmemeval_mxbai"

RUN_DIR = {
    SYSTEM_A: "allminilm",
    SYSTEM_B: "bge_m3",
    SYSTEM_C: "mxbai",
}
LABEL = {
    SYSTEM_A: "all-MiniLM",
    SYSTEM_B: "BGE-M3",
    SYSTEM_C: "mxbai",
}

JUDGE_DIRS = {
    "Sonnet 4": "full_audit_output",
    "Opus 4.7": "full_audit_opus",
    "Gemini 3.1": "full_audit_gemini",
    "GPT-5.5": "full_audit_gpt5.5",
    "DeepSeek V4": "full_audit_deepseek",
}
LABELS_3 = ("supports", "partial", "does_not_support")

# How many ranks the film shows. The saved traces are 60 deep; the page draws
# the head of the list, which is where the whole story happens.
SHOWN_RANKS = 14

# Figures as published in the paper. The script recomputes what it can and
# records both, so a divergence is visible rather than silently papered over.
PUBLISHED = {
    "ndcg_change_rate_low": 83.4,
    "ndcg_change_rate_high": 94.0,
    "audit_cases": 1902,
    "majority_n": 1876,
    "supports_pct": 29.2,
    "partial_pct": 39.6,
    "does_not_support_pct": 31.2,
}


def read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8", errors="replace") as fh:
        return list(csv.DictReader(fh))


def run_path(paper_repo: Path, system: str, name: str) -> Path:
    return paper_repo / "MTEL-Mem" / "artifacts" / "runs" / "longmemeval" / RUN_DIR[system] / name


def trace_for(paper_repo: Path, system: str, query_index: int) -> dict | None:
    """Pull one query's saved ranked output from a run's trace.

    Returns None when the run's trace is not archived in the paper repo. Only
    the two systems in the flip need their ranking drawn on screen; the
    contrast system is quoted from the audit rows alone.
    """
    path = run_path(paper_repo, system, "trace.jsonl.gz")
    if not path.exists():
        return None
    with gzip.open(path, "rt", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            row = json.loads(line)
            if row["query_index"] == query_index:
                return row
    raise SystemExit(f"query {query_index} not found in {path}")


def aggregate_targets(paper_repo: Path, system: str) -> dict | None:
    path = run_path(paper_repo, system, "target_rescore.json")
    if not path.exists():
        return None
    blob = json.loads(path.read_text(encoding="utf-8"))
    keep = ("queries", "hit_rate_at_k", "recall_at_k", "mrr", "ndcg_at_k", "top1_hit_rate")
    return {
        target: {k: blob["targets"][target][k] for k in keep}
        for target in ("raw_turn", "source_family", "canonical")
    }


def judge_votes(paper_repo: Path) -> tuple[dict, dict]:
    """Per-case labels from all five judges, plus the majority-vote summary."""
    per_judge: dict[str, dict] = {}
    for judge, folder in JUDGE_DIRS.items():
        rows = read_csv(paper_repo / "data" / folder / "judged_cases.csv")
        per_judge[judge] = {
            (r["run_label"], r["query_index"], r["audit_target"]): r["judge_semantic_label"]
            for r in rows
        }

    keys = set().union(*(set(v) for v in per_judge.values()))
    majority: dict[tuple, str] = {}
    for key in keys:
        votes = [per_judge[j][key] for j in per_judge if per_judge[j].get(key) in LABELS_3]
        if not votes:
            continue
        ranked = collections.Counter(votes).most_common()
        if len(ranked) == 1 or ranked[0][1] > ranked[1][1]:
            majority[key] = ranked[0][0]

    counts = collections.Counter(majority.values())
    total = len(majority)
    recomputed = {
        "majority_n": total,
        "supports_pct": round(100 * counts["supports"] / total, 1),
        "partial_pct": round(100 * counts["partial"] / total, 1),
        "does_not_support_pct": round(100 * counts["does_not_support"] / total, 1),
    }
    return per_judge, {"majority": majority, "recomputed": recomputed}


def build(paper_repo: Path) -> dict:
    audit = read_csv(paper_repo / "data" / "all_audit_cases.csv")
    sizes = read_csv(paper_repo / "data" / "target_sizes.csv")
    per_judge, vote = judge_votes(paper_repo)
    majority = vote["majority"]

    qi = str(QUERY_INDEX)
    systems = {}
    for system in (SYSTEM_A, SYSTEM_B, SYSTEM_C):
        trace = trace_for(paper_repo, system, QUERY_INDEX)
        cases = {
            r["audit_target"]: r
            for r in audit
            if r["run_label"] == system and r["query_index"] == qi
        }
        if not cases:
            raise SystemExit(f"no audit rows for {system} q{qi}")
        any_case = next(iter(cases.values()))

        targets = {}
        for target, key in (("source", "source_family"), ("canonical", "canonical")):
            row = cases[key]
            vote_key = (system, qi, key)
            targets[target] = {
                "ndcg": float(row["target_ndcg"]),
                "credited_rank": int(row["credited_rank"]),
                "credited_memory_id": row["credited_memory_id"],
                "credited_kind": row["credited_kind"],
                "credited_content": row["credited_content"],
                "judges": {j: per_judge[j].get(vote_key) for j in JUDGE_DIRS},
                "judge_majority": majority.get(vote_key),
            }
        # Raw is the same number across the audit rows for a query: the raw
        # source turn is either retrieved or it is not, and here it is not.
        targets["raw"] = {
            "ndcg": float(any_case["raw_ndcg"]),
            "credited_rank": None,
            "credited_memory_id": None,
            "credited_kind": "raw_turn",
            "credited_content": None,
            "judges": {},
            "judge_majority": None,
        }

        systems[system] = {
            "label": LABEL[system],
            "run_dir": RUN_DIR[system],
            "has_trace": trace is not None,
            "hit_ranks": trace["hit_ranks"] if trace else None,
            "expected_memory_ids": trace["expected_memory_ids"] if trace else None,
            "ranking_depth": len(trace["ranked_preview"]) if trace else None,
            "ranked_preview": [
                {
                    "rank": it["rank"],
                    "memory_id": it["memory_id"],
                    "is_expected": it["is_expected"],
                    "content": it["normalized_content"],
                }
                for it in trace["ranked_preview"][:SHOWN_RANKS]
            ] if trace else [],
            "targets": targets,
            "aggregate": aggregate_targets(paper_repo, system),
        }

    trace_a = trace_for(paper_repo, SYSTEM_A, QUERY_INDEX)
    if trace_a is None:
        raise SystemExit(f"no saved trace for {SYSTEM_A}; the film needs its ranking")
    size_rows = [r for r in sizes if r["query_index"] == qi and "longmemeval" in r["run_id"]]

    a_src = systems[SYSTEM_A]["targets"]["source"]["ndcg"]
    b_src = systems[SYSTEM_B]["targets"]["source"]["ndcg"]
    a_can = systems[SYSTEM_A]["targets"]["canonical"]["ndcg"]
    b_can = systems[SYSTEM_B]["targets"]["canonical"]["ndcg"]
    if (a_src - b_src) * (a_can - b_can) >= 0:
        raise SystemExit("the chosen pair no longer flips; pick another exemplar")

    runs_root = paper_repo / "MTEL-Mem" / "artifacts" / "runs"
    bundle = {
        family.name: sorted(p.name for p in family.iterdir() if p.is_dir())
        for family in sorted(runs_root.iterdir())
        if family.is_dir()
    }
    bundle_total = sum(len(v) for v in bundle.values())

    return {
        "_generated_by": "scripts/sync-tiap-data.py",
        "_source_repo": str(paper_repo),
        "_note": (
            "Every number shown on /tiap comes from this file. Regenerate with "
            "python3 scripts/sync-tiap-data.py after the paper's results change."
        ),
        "paper": {
            "title": "Same Ranking, Different Winner: How Scoring Targets Shape LLM Memory Benchmarks",
            "venue": "Findings of EMNLP 2026",
            "arxiv": "2605.24060",
            "code": "https://github.com/rabdelfattahlab/LLM_Memory_Benchmark",
        },
        "case": {
            "dataset": DATASET,
            "query_index": QUERY_INDEX,
            "tenant_id": trace_a["tenant_id"],
            "query": trace_a["query"],
            "reference_answer": trace_a["reference_answer"],
            "category_label": trace_a.get("category_label"),
            "top_k": trace_a and len(trace_a["ranked_preview"]),
            "target_sizes": [
                {
                    "run_id": r["run_id"],
                    "n_fixture_indexes": int(r["n_fixture_indexes"]),
                    "n_expected_memory_ids": int(r["n_expected_memory_ids"]),
                    "expected_group_count": int(r["expected_group_count"]),
                    "expected_group_sizes": r["expected_group_sizes"],
                }
                for r in size_rows
            ],
        },
        "figure": {
            "_source": "paper/figures/A_framework_overview.pdf",
            "_note": (
                "The short ranked trace printed inside the paper's framework figure. It is that "
                "figure's own illustration of a ranked output, not a row of any saved run, and the "
                "method scene reproduces it as such."
            ),
            "illustrative_trace": [["1", "m7", "0.73"], ["2", "m3", "0.62"], ["3", "m9", "0.21"]],
        },
        "bundle": {
            "families": bundle,
            "total_runs": bundle_total,
            "_note": (
                "Counted from the artifact tree, not from the upstream README, whose prose "
                "describes 8 native runs and an f1/f5/f8 density sweep while the bundle ships "
                "7 native runs and f1/f8 only."
            ),
        },
        "systems": systems,
        "flip": {
            "pair": [LABEL[SYSTEM_A], LABEL[SYSTEM_B]],
            "source_winner": LABEL[SYSTEM_A] if a_src > b_src else LABEL[SYSTEM_B],
            "canonical_winner": LABEL[SYSTEM_A] if a_can > b_can else LABEL[SYSTEM_B],
            "delta_source": round(a_src - b_src, 6),
            "delta_canonical": round(a_can - b_can, 6),
        },
        "audit": {
            "published": PUBLISHED,
            "recomputed": vote["recomputed"],
            "judges": list(JUDGE_DIRS),
            "_reconciliation": (
                "The paper reports a five-model majority over n=1876 cases "
                "(29.2 / 39.6 / 31.2). Recomputing the plurality here keeps 1891 "
                "cases and gives 29.1 / 39.7 / 31.1; the 15-case gap is in which "
                "cases qualify for a majority. The page quotes the published figures."
            ),
        },
    }


def numbers_in(text: str) -> set[str]:
    return set(re.findall(r"\d+\.\d+|\d+", text))


def display_expectations(data: dict) -> list[tuple[str, str]]:
    """Figures rendered in the scene markup, paired with the value that backs them.

    The DATA block check below covers the numbers that drive the choreography.
    These are the ones written into the markup by hand, so each is asserted
    against the artifact value it claims to report.
    """
    pub = data["audit"]["published"]
    out = []
    for system in (SYSTEM_A, SYSTEM_B):
        agg = data["systems"][system]["aggregate"]
        label = LABEL[system]
        for target in ("raw_turn", "source_family", "canonical"):
            out += [
                (f"{agg[target]['ndcg_at_k']:.3f}", f"{label} table, {target} nDCG"),
                (f"{agg[target]['hit_rate_at_k']:.3f}", f"{label} table, {target} hit rate"),
                (str(agg[target]["queries"]), f"{label} table, {target} query count"),
            ]
    out += [
        (f"{pub['ndcg_change_rate_low']}", "headline, low end of the nDCG change rate"),
        (f"{pub['ndcg_change_rate_high']}", "headline, high end of the nDCG change rate"),
        (f"{pub['supports_pct']}", "headline, share of fully justified credit"),
        (f"{pub['audit_cases']:,}", "headline, semantic audit size"),
        (str(data["bundle"]["total_runs"]), "headline, number of saved runs"),
    ]
    return out


def check(data: dict) -> int:
    """Verify every number rendered in the page exists in the data file."""
    if not PAGE.exists():
        print(f"note: {PAGE.relative_to(SITE)} does not exist yet, nothing to check")
        return 0

    html = PAGE.read_text(encoding="utf-8")

    missing_display = [
        (value, what) for value, what in display_expectations(data) if value not in html
    ]
    if missing_display:
        print("FAIL: the page no longer shows these artifact values:")
        for value, what in missing_display:
            print(f"  {value}  ({what})")
        return 1

    block = re.search(r"//\s*DATA:BEGIN(.*?)//\s*DATA:END", html, re.S)
    if not block:
        print("FAIL: no // DATA:BEGIN ... // DATA:END block in index.html")
        return 1

    haystack = json.dumps(data)
    allowed = numbers_in(haystack)
    # Values the page derives for display: percentages and rounded scores.
    for system in data["systems"].values():
        for target in system["targets"].values():
            if target["ndcg"] is not None:
                allowed.add(f"{target['ndcg']:.3f}")
                allowed.add(f"{target['ndcg']:.3f}".lstrip("0"))
                allowed.add(str(round(target["ndcg"] * 100)))

    missing = sorted(n for n in numbers_in(block.group(1)) if n not in allowed)
    if missing:
        print("FAIL: numbers in index.html with no source in tiap-case.json:")
        for n in missing:
            print(f"  {n}")
        return 1
    print(f"ok: data block and {len(display_expectations(data))} displayed figures "
          f"all trace back to {OUT_JSON.name}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--paper-repo", type=Path, default=DEFAULT_PAPER_REPO)
    ap.add_argument("--check", action="store_true", help="verify the page without rewriting the JSON")
    args = ap.parse_args()

    if args.check:
        if not OUT_JSON.exists():
            print(f"FAIL: {OUT_JSON} missing, run without --check first")
            return 1
        return check(json.loads(OUT_JSON.read_text(encoding="utf-8")))

    if not args.paper_repo.exists():
        print(f"FAIL: paper repo not found at {args.paper_repo}")
        return 1

    data = build(args.paper_repo)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT_JSON.relative_to(SITE)}")

    flip = data["flip"]
    print(f"  exemplar : {DATASET} q{QUERY_INDEX}  {data['case']['query']}")
    print(f"  answer   : {data['case']['reference_answer']}")
    print(f"  flip     : Source -> {flip['source_winner']}, Canonical -> {flip['canonical_winner']}")
    print(f"  audit    : recomputed {data['audit']['recomputed']}")
    return check(data)


if __name__ == "__main__":
    sys.exit(main())
