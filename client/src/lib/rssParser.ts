export async function validateRssFeed(url: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/feeds/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      return { isValid: false, error: data.error || 'Invalid RSS feed' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Network error occurred' };
  }
}
