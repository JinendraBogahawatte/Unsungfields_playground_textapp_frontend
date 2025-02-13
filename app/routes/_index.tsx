import { useState } from "react";

const models = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-guard-3-8b",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "whisper-large-v3",
  "whisper-large-v3-turbo",
  "qwen-2.5-32b",
  "deepseek-r1-distill-qwen-32b",
  "deepseek-r1-distill-llama-70b-specdec",
  "deepseek-r1-distill-llama-70b",
  "llama-3.3-70b-specdec",
  "llama-3.2-1b-preview",
  "llama-3.2-3b-preview",
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
];

export default function Index() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [stream, setStream] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [moderation, setModeration] = useState(false);
  const [topP, setTopP] = useState(1);
  const [seed, setSeed] = useState("");
  const [stopSequence, setStopSequence] = useState("");
  const [viewCode, setViewCode] = useState(false);
  const [codeFormat, setCodeFormat] = useState("python");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const res = await fetch("https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        max_tokens: maxTokens,
        temperature,
        stream,
        json_mode: jsonMode,
        moderation,
        top_p: topP,
        seed: seed ? Number(seed) : null,
        stop: stopSequence || null,
      }),
    });

    if (stream) {
      const reader = res.body?.getReader();
      if (!reader) {
        setLoading(false);
        setResponse("Error: Streaming not supported.");
        return;
      }
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setResponse(fullText);
      }
    } else {
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "Error fetching response");
    }

    setLoading(false);
  };

  const generateCodeSnippet = () => {
    const payload = JSON.stringify(
      {
        model: selectedModel,
        prompt,
        max_tokens: maxTokens,
        temperature,
        stream,
        json_mode: jsonMode,
        moderation,
        top_p: topP,
        seed: seed ? Number(seed) : null,
        stop: stopSequence || null,
      },
      null,
      2
    );

    switch (codeFormat) {
      case "python":
        return `import requests\n\nurl = "https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/"\nheaders = {"Content-Type": "application/json"}\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
      case "javascript":
        return `fetch("https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/", {\n  method: "POST",\n  headers: {"Content-Type": "application/json"},\n  body: JSON.stringify(${payload})\n}).then(res => res.json()).then(console.log);`;
      case "curl":
        return `curl -X POST "https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/" -H "Content-Type: application/json" -d '${payload}'`;
      case "json":
        return payload;
      case "java":
        return `// Java Code Example\nimport java.net.http.HttpClient;\nimport java.net.URI;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\nHttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n        .uri(new URI("https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/"))\n        .header("Content-Type", "application/json")\n        .POST(HttpRequest.BodyPublishers.ofString(${payload}))\n        .build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.body());`;
      case "c#":
        return `// C# Example\nusing System;\nusing System.Net.Http;\nusing System.Text;\n\nHttpClient client = new HttpClient();\nvar content = new StringContent(${payload}, Encoding.UTF8, "application/json");\nvar response = await client.PostAsync("https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/", content);\nConsole.WriteLine(await response.Content.ReadAsStringAsync());`;
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <h1 className="text-lg font-bold mb-4">Unsungfields<span className="text-red-500"> Cloud</span></h1>
        <nav className="flex flex-col gap-3">
          <a href="#" className="text-red-500 font-medium">Playground</a>
          <a href="#" className="text-gray-600">Documentation</a>
          <a href="#" className="text-gray-600">Metrics</a>
          <a href="#" className="text-gray-600">API Keys</a>
          <a href="#" className="text-gray-600">Settings</a>
        </nav>
        <div className="mt-auto">
          <button className="bg-gray-200 p-2 rounded w-full">Personal</button>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Playground</h2>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="border p-2 rounded">
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Response Panel */}
        <div className="flex-1 bg-white shadow-md rounded p-4 mt-4">
          {response ? (
            <div className="p-4 border rounded bg-gray-100">{response}</div>
          ) : (
            <p className="text-gray-400 text-center">Enter a prompt to get started.</p>
          )}
        </div>

        {/* Input & Controls */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
          <textarea className="border p-2 rounded w-full" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Type your message..." />

          {/* Parameter Controls */}
          <div className="mt-4 p-4 bg-white rounded shadow-md">
            <h3 className="font-bold mb-2">Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                Temperature:
                <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="ml-2 w-full" />
                <span className="ml-2">{temperature}</span>
              </label>
              <label className="flex items-center">
                Max Completion Tokens:
                <input type="number" min="1" max="4096" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className="ml-2 w-16 border p-1 rounded" />
              </label>
              <label className="flex items-center">
                Stream:
                <input type="checkbox" checked={stream} onChange={() => setStream(!stream)} className="ml-2" />
              </label>
              <label className="flex items-center">
                JSON Mode:
                <input type="checkbox" checked={jsonMode} onChange={() => setJsonMode(!jsonMode)} className="ml-2" />
              </label>
              <label className="flex items-center">
                Top P:
                <input type="range" min="0" max="1" step="0.01" value={topP} onChange={(e) => setTopP(Number(e.target.value))} className="ml-2 w-full" />
                <span className="ml-2">{topP}</span>
              </label>
              <label className="flex items-center">
                Seed:
                <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} className="ml-2 border p-1 rounded w-24" />
              </label>
              <label className="flex items-center">
                Stop Sequence:
                <input type="text" value={stopSequence} onChange={(e) => setStopSequence(e.target.value)} className="ml-2 border p-1 rounded w-24" />
              </label>
            </div>
          </div>

          {/* View Code Button */}
          <button type="button" onClick={() => setViewCode(!viewCode)} className="mt-2 p-2 bg-gray-500 text-white rounded">
            {viewCode ? "Hide Code" : "View Code"}
          </button>

          {/* Code Snippet View */}
          {viewCode && (
            <div className="mt-2 p-4 bg-gray-900 text-white rounded font-mono">
              <select value={codeFormat} onChange={(e) => setCodeFormat(e.target.value)} className="mb-2 p-2 border rounded bg-white text-black">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="curl">cURL</option>
                <option value="json">JSON</option>
                <option value="java">Java</option>
                <option value="c#">C#</option>
              </select>
              <pre>{generateCodeSnippet()}</pre>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded" disabled={loading}>
            {loading ? "Generating..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
