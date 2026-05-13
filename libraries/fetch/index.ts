export async function tntFetch(url: string, options?: RequestInit): Promise<{ res: Response | null, json: any, text: string | null, data: ArrayBuffer | null }> {
    let response = null
    let json = null
    let text = null
    let data = null
    try {
        response = await fetch(url, options);
        let arrayBuffer = await response.arrayBuffer();

        if (response.headers.get("content-type")?.includes("application/json")) {
            json = JSON.parse(new TextDecoder().decode(arrayBuffer));
        } else if (response.headers.get("content-type")?.includes("text/")) {
            text = new TextDecoder().decode(arrayBuffer);
        } else {
            data = arrayBuffer;
        }
    } catch (err) {
        console.log(`Fetch error: ${err}`);
        return { res: response, json: null, text: null, data: null };
    }

    return { res: response, json: json, text: text, data: data };
}