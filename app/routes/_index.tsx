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

export default function Playground() {
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
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
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <h1 className="text-lg font-bold mb-4">Unsungfields<span className="text-red-500"> Cloud</span></h1>
        <nav className="flex flex-col gap-3">
          <a href="#" className="text-red-500 font-medium">Playground</a>
          <a href="#" className="text-gray-600">Documentation</a>
          <a href="#" className="text-gray-600">Metrics</a>
          <a href="#" className="text-gray-600">API Keys</a>
          <a href="#" className="text-gray-600">Settings</a>
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-xl font-bold">Playground</h2>

        {/* Model Dropdown */}
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="border p-2 rounded mt-4">
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
          {/* Prompt Input */}
          <textarea className="border p-2 rounded w-full" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Type your message..." />

          {/* Parameters Panel */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <label>Temperature</label>
              <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
            </div>
            <div className="flex flex-col">
              <label>Max Completion Tokens</label>
              <input type="number" min="1" max="4096" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
            </div>
            <div className="flex flex-col">
              <label>Stream</label>
              <input type="checkbox" checked={stream} onChange={() => setStream(!stream)} />
            </div>
            <div className="flex flex-col">
              <label>JSON Mode</label>
              <input type="checkbox" checked={jsonMode} onChange={() => setJsonMode(!jsonMode)} />
            </div>
          </div>

          {/* Advanced Button */}
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mt-2 p-2 bg-gray-500 text-white rounded">Advanced</button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-white rounded shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <label>Moderation</label>
                  <input type="checkbox" checked={moderation} onChange={() => setModeration(!moderation)} className="ml-2" />
                </div>
                <div className="flex items-center">
                  <label>Top P</label>
                  <input type="range" min="0" max="1" step="0.01" value={topP} onChange={(e) => setTopP(Number(e.target.value))} />
                </div>
                <div className="flex items-center">
                  <label>Seed</label>
                  <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} />
                </div>
                <div className="flex items-center">
                  <label>Stop Sequence</label>
                  <input type="text" value={stopSequence} onChange={(e) => setStopSequence(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">{loading ? "Generating..." : "Submit"}</button>
        </form>

        {/* View Code Button */}
        {viewCode && (
          <div className="mt-4 p-4 bg-gray-900 text-white rounded font-mono">
            <pre>{generateCodeSnippet()}</pre>
          </div>
        )}
        <button type="button" onClick={() => setViewCode(!viewCode)} className="mt-4 p-2 bg-gray-500 text-white rounded">{viewCode ? "Hide Code" : "View Code"}</button>
      </div>
    </div>
  );
}
