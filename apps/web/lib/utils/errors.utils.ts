export async function getErrorMessage(response: Response): Promise<string> {
  return response.json().then((json) => {
    if (process.env.NODE_ENV === "development") {
      console.error(json);
    }

    return json?.message ?? String(json);
  });
}
