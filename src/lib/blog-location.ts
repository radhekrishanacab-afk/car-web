export interface BlogLocation {
  state: string | null
  district: string | null
  showState: boolean
  showDistrict: boolean
}

/** "Surat, Gujarat" — only the parts the admin chose to show on the website. */
export function blogLocationLabel(post: BlogLocation): string {
  return [post.showDistrict && post.district, post.showState && post.state].filter(Boolean).join(', ')
}
