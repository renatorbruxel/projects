# Implementation decisions

| Choice | Reason | Alternative and trade-off |
|---|---|---|
| Keep the five existing module URLs | Preserve incoming links and domain coverage | Three completely new repositories would duplicate shared context and break the existing portfolio |
| Shared static engine with SQLite cross-checks | Works on GitHub Pages and runs locally without credentials | A live backend would add deployment and authentication beyond the current demonstration |
| Preserve Kaggle as observed educational data | Keep provenance, original dates and missingness inspectable | Relabeling the source as current commercial data would misstate its coverage |
| Generate separate planning, subscription and payments facts | Supply absent grains without claiming they came from the CRM | Imputing targets, open amounts or ARR inside the observed source would hide assumptions |
| Model and baseline both reported | Synthetic tests demonstrate methodology, not guaranteed superiority | Selecting a model only after looking at results would obscure validation limits |
| Source-grounded deterministic copilot | Exact metrics, citations, read-only behavior and offline use | External LLM integration remains a documented future adapter, disabled by absence |
| Human call distinct from metric scenario | A manager may choose a different commitment and document why | Silently overwriting modeled metrics with input values would destroy reproducibility |
| Preserve source gaps | Missing original quota code and dated professional evidence cannot be inferred | The independent capacity model replaces capability, without claiming source recovery |
