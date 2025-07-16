# 🚨 HOTFIX: Review and Update Groq Model Configurations

## Issue Description
Client reported concern about deprecated Groq model `qwen-qwq-32b` usage, requesting replacement with `qwen/qwen3-32b`. Investigation needed to verify current model usage and ensure we're using supported, non-deprecated models.

## Analysis Results
✅ **Good News**: No usage of `qwen-qwq-32b` found in codebase  
⚠️ **Action Needed**: Verify current models are still supported

## Current Model Configuration

### gcf-auth-groq Package:
- **Default model**: `llama-3.1-8b-instant` (`packages/gcf-auth-groq/src/schema.ts:8`)
- **Summarization model**: `llama-3.3-70b-versatile` (`packages/gcf-auth-groq/src/handlers.ts:98`)

### Client-side:
- **Groq handler**: `llama-3.1-8b-instant` (`pages/new-tab/src/lib/utils/ask-assistant/groq-handler.ts:19`)
- **OpenAI default**: `gpt-4o-mini-2024-07-18` (when enabled)

## Recommended Actions

### 1. Model Verification (Priority: High)
- [ ] Verify `llama-3.1-8b-instant` is still supported by Groq API
- [ ] Verify `llama-3.3-70b-versatile` is still supported by Groq API
- [ ] Check Groq documentation for any deprecation notices

### 2. Model Updates (Priority: Medium)
- [ ] Consider upgrading to newer Llama models if available
- [ ] Evaluate if `qwen/qwen3-32b` would be beneficial for specific use cases
- [ ] Test performance with any new models

### 3. Code Improvements (Priority: Low)
- [ ] Add model validation in schema to prevent deprecated models
- [ ] Add environment variable for model configuration
- [ ] Update error handling for unsupported models

## Files to Modify

```
packages/gcf-auth-groq/src/
├── schema.ts (line 8) - Default model
├── handlers.ts (line 98) - Summarization model
└── [new] model-config.ts - Centralized model configuration

pages/new-tab/src/lib/utils/ask-assistant/
└── groq-handler.ts (line 19) - Client-side model
```

## Testing Checklist
- [ ] Verify API calls work with current models
- [ ] Test summarization functionality still works
- [ ] Test client-side Groq integration
- [ ] Verify error handling for invalid models
- [ ] Performance test with any new models

## Acceptance Criteria
- [ ] All models in use are verified as supported by Groq
- [ ] No deprecated models are used anywhere in the codebase
- [ ] Model configuration is centralized and maintainable
- [ ] Proper error handling for unsupported models
- [ ] Documentation updated with current model choices

## Priority: High
This is a potential production issue if current models become deprecated.

## Estimated Effort: 2-4 hours
- 1 hour: Model verification and research
- 1-2 hours: Code updates if needed
- 1 hour: Testing and validation

---

**Note**: While the original request mentioned `qwen-qwq-32b` → `qwen/qwen3-32b`, this model was not found in the current codebase. This issue focuses on ensuring all current models are up-to-date and supported.