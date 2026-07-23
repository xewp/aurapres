import { getActivePrompt, saveCustomPrompt, deleteCustomPrompt } from '../services/promptService.js'
import { supabase } from '../services/supabase.js'
import { BUILT_IN_PROMPTS } from '../agents/promptManager.js'

// ──────────────────────────────────────────────
// GET /api/prompts
// Returns all active prompts for the user
// (mix of their customs and system defaults)
// ──────────────────────────────────────────────
export const getPrompts = async (req, res) => {
  try {
    const agents = Object.keys(BUILT_IN_PROMPTS)
    
    // Fetch active prompts for all agents
    const prompts = await Promise.all(
      agents.map(async (agentType) => {
        try {
          const dbPrompt = await getActivePrompt(req.userId, agentType)
          return {
            agentType,
            systemPrompt: dbPrompt ? dbPrompt.system_prompt : BUILT_IN_PROMPTS[agentType],
            isCustom: !!(dbPrompt && dbPrompt.user_id === req.userId)
          }
        } catch {
          // Fallback to built-in if DB fails
          return {
            agentType,
            systemPrompt: BUILT_IN_PROMPTS[agentType],
            isCustom: false
          }
        }
      })
    )

    return res.status(200).json({ success: true, data: prompts })
  } catch (err) {
    console.error('❌ Get Prompts error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// PUT /api/prompts/:agentType
// Update a custom prompt for a specific agent
// ──────────────────────────────────────────────
export const updatePrompt = async (req, res) => {
  try {
    const { agentType } = req.params
    const { systemPrompt } = req.body

    if (!BUILT_IN_PROMPTS[agentType]) {
      return res.status(400).json({ success: false, error: 'Invalid agent type' })
    }

    const prompt = await saveCustomPrompt(req.userId, agentType, systemPrompt)
    
    return res.status(200).json({ success: true, data: prompt })
  } catch (err) {
    console.error('❌ Update Prompt error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// DELETE /api/prompts/:agentType
// Reset a custom prompt back to system default
// ──────────────────────────────────────────────
export const resetPrompt = async (req, res) => {
  try {
    const { agentType } = req.params

    // Instead of deleting by ID, we delete all custom prompts for this user and agentType
    await supabase.from('prompts').delete().eq('user_id', req.userId).eq('agent_type', agentType)
    
    return res.status(200).json({ 
      success: true, 
      message: 'Reset to default',
      data: {
        agentType,
        systemPrompt: BUILT_IN_PROMPTS[agentType],
        isCustom: false
      }
    })
  } catch (err) {
    console.error('❌ Reset Prompt error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
