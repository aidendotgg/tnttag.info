export async function tntFetch(url: string, options?: RequestInit): Promise<{ res: Response | null, data: any }> {
    let response
    let json = null
    try {
        response = await fetch(url, options);

        if (response.headers.get("content-type")?.includes("application/json")) {
            json = await response.json();
        }
    } catch (err) {
        console.log(`Fetch error: ${err}`);
        return { res: null, data: null };
    }

    return { res: response, data: json };
}