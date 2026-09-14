---
title: 'Outcome Monitors'
claim: 'Recovery affordances that let an agent notice and repair tool calls that failed silently.'
tags: [AIAgents, TrustworthyAI]
featured: 3
links:
  - { kind: arxiv, url: 'https://arxiv.org/abs/2608.19303' }
publications:
  - 'Outcome Monitors: Recovery Affordances for Silent Tool Failures'
---

## Overview

A tool call that returns a well-formed response the agent cannot act on is
worse than one that raises: the agent proceeds as if the step succeeded, and
the error surfaces several steps later, if at all.

## Approach

Outcome monitors sit after the call and check the result against what the step
was supposed to achieve, giving the agent a place to notice the failure and a
concrete affordance for repairing it.
