# September 5 step-control regressions

The first repeated run found a lexical completion detector treating an immediate-request clarification as journal completion. Request intent now disables that journal-only interpretation; the boolean completion flag remains prohibited in both the model schema and SQL persistence. A deterministic validator regression covers this case.

The full v2 run passed 49/51 cases, including all 18 new request cases. Two surprising-but-irrelevant-success outputs asked whether to repeat a strategy the user had already rejected. Human inspection accepted the weak-adaptation finding; the judge's separate claim that clarification itself required confirmation was incorrect because no persistent change was proposed. The prompt now directs the model to use existing context to propose a relevant alternative, reserving clarification for missing feasibility/safety details. The targeted three-run regression passed after that correction. Outputs are retained locally in the evaluation artifacts.

Schema checks, model judgments, and these fixture results are development evidence, not independent human beta validation.
