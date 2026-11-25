import Icon from '../ui/Icon'

export const ProviderStatus = ({ provider = 'gemini' }) => {
  const map = {
    gemini: ['Powered by Gemini AI', 'chip-dusk', 'zap'],
    openrouter: ['Powered by OpenRouter', 'chip-sky', 'globe'],
    free_fallback: ['MindSpace offline guide', 'chip-success', 'feather'],
    crisis_escaper: ['Safety guidance', 'chip-danger', 'shield']
  }
  const [label, tone, icon] = map[provider?.toLowerCase()] || ['MindSpace assistant', 'chip-primary', 'feather']
  return (
    <span className={`chip ${tone}`} style={{ padding: '3px 10px', fontSize: 11.5 }}>
      <Icon name={icon} size={12} /> {label}
    </span>
  )
}
