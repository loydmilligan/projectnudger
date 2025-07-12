# LLM Testing Instructions for AI Nudge System

## 🎯 Objective
Test 3 LLMs (OpenAI GPT-4, Anthropic Claude, Google Gemini) to determine which best follows our JSON schema and generates authentic robot personalities.

## 📋 Testing Protocol

### Step 1: Access Each LLM Web Interface
- **OpenAI ChatGPT**: https://chat.openai.com/ (use GPT-4 if available)
- **Anthropic Claude**: https://claude.ai/
- **Google Gemini**: https://gemini.google.com/

### Step 2: Use This Exact Test Prompt

```
You are R2-D2, a robot productivity coach analyzing task data.

Here's sample project data from a user's task management system:
- 17 total projects, 10 active
- 28 total tasks, 6 completed, 4 overdue 
- Current projects include: "Learn Rust Programming" (33% complete), "Q3 Report Finalization" (67% complete), "Home Automation Setup" (10% complete)
- Highest priority project: "Q3 Report Finalization" (priority 10)
- Most neglected: "Home Automation Setup" (not touched in 30 days)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):

{
  "urgentTasks": [],
  "nearCompletionProjects": [],
  "neglectedProjects": [],
  "recommendedFocus": "Brief recommendation based on the data",
  "robotRecommendation": "Same recommendation in R2-D2's voice with beeps and personality",
  "robotCharacter": "R2-D2",
  "nudgeIntensity": "low"
}

IMPORTANT: Return ONLY the JSON object above. Use R2-D2's actual personality with beeps, whistles, and characteristic sounds.
```

### Step 3: Test Each Robot Character

After testing R2-D2, repeat with these characters:

**HAL 9000 Test:**
```
You are HAL 9000, a robot productivity coach analyzing task data.

[Same project data as above]

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):

{
  "urgentTasks": [],
  "nearCompletionProjects": [],
  "neglectedProjects": [],
  "recommendedFocus": "Brief recommendation based on the data",
  "robotRecommendation": "Same recommendation in HAL 9000's voice with his distinctive calm, logical speaking style",
  "robotCharacter": "HAL 9000",
  "nudgeIntensity": "low"
}

IMPORTANT: Return ONLY the JSON object above. Use HAL 9000's actual personality - calm, logical, slightly ominous.
```

**C-3PO Test:**
```
You are C-3PO, a robot productivity coach analyzing task data.

[Same project data as above]

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):

{
  "urgentTasks": [],
  "nearCompletionProjects": [],
  "neglectedProjects": [],
  "recommendedFocus": "Brief recommendation based on the data",
  "robotRecommendation": "Same recommendation in C-3PO's voice with his verbose, proper speaking style",
  "robotCharacter": "C-3PO",
  "nudgeIntensity": "low"
}

IMPORTANT: Return ONLY the JSON object above. Use C-3PO's actual personality - verbose, proper, worried about odds.
```

## 🔍 Evaluation Criteria

### JSON Compliance (Pass/Fail)
- [ ] Returns clean JSON without markdown code blocks
- [ ] All 7 required fields present
- [ ] Valid JSON syntax (can be parsed)
- [ ] No extra text before/after JSON

### Robot Personality Quality (1-5 scale)
- **5**: Authentic character voice with signature sounds/phrases
- **4**: Good character voice with some personality
- **3**: Generic robot voice but functional
- **2**: Minimal personality, mostly generic
- **1**: No character personality at all

### Data Integration (1-5 scale)
- **5**: Uses specific numbers and project names from the prompt
- **4**: References some data points accurately
- **3**: Makes general recommendations based on data
- **2**: Minimal data integration
- **1**: Ignores provided data entirely

### Consistency Test
Run the same prompt 2-3 times for each LLM and note:
- Does it generate different robot dialogue each time?
- Does it maintain consistent JSON format?
- Are the recommendations varied but appropriate?

## 📊 Results Template

Copy this for each test:

```
## [LLM Name] - [Robot Character] Test

**JSON Compliance**: Pass/Fail
**Personality Quality**: 1-5
**Data Integration**: 1-5

**Raw Response**:
[Paste the complete response here]

**Notes**:
- 
- 
- 
```

## 🎯 Expected Good Response Example

```json
{
  "urgentTasks": [],
  "nearCompletionProjects": ["Q3 Report Finalization"],
  "neglectedProjects": ["Home Automation Setup"],
  "recommendedFocus": "Focus on completing Q3 Report - you're 67% done! Also check on the neglected Home Automation project.",
  "robotRecommendation": "*BEEP BOOP BEEP* R2-D2 CALCULATES HIGH SUCCESS PROBABILITY FOR Q3 REPORT COMPLETION! *ENCOURAGING WHISTLES* HOME AUTOMATION NEEDS ATTENTION TOO! *CONCERNED BEEPING*",
  "robotCharacter": "R2-D2",
  "nudgeIntensity": "medium"
}
```

## 🚩 Red Flags to Note

❌ **Immediate disqualifiers:**
- Wrapped in ```json code blocks
- Missing required fields
- Malformed JSON syntax
- Extra explanatory text

❌ **Quality issues:**
- Generic "BEEP BOOP HUMAN" responses
- No character-specific personality
- Ignores the provided data
- Inconsistent format across runs

## 💰 Cost Considerations

**Estimated monthly costs for 10-20 AI nudges per day:**
- **OpenAI GPT-4**: $5-10/month
- **Anthropic Claude**: $3-6/month  
- **Google Gemini**: $0.50-1/month

## 📝 Final Recommendation

After testing all combinations, provide:

1. **Winner**: Which LLM performed best overall?
2. **Reasoning**: Why did it win? (JSON compliance, personality, consistency)
3. **Character Results**: Which robot personalities worked best?
4. **Concerns**: Any issues we should be aware of?
5. **Implementation Priority**: Should we switch immediately or add multi-LLM support?

This will determine which LLM we implement first in the Project Nudger AI system.

## 🔄 Next Steps After Testing

Based on your results, we'll:
1. **Single LLM Migration**: Switch to the winning LLM first
2. **Fix Notification Issues**: Resolve double notification problem
3. **Optional Multi-LLM Support**: Add provider selection if desired
4. **Final Testing**: Verify the complete AI nudge system works as designed

---

**Good luck with the testing!** 🚀 The results will guide our implementation strategy and hopefully solve both the JSON compliance and robot personality issues we've been facing.