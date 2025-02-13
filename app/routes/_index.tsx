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

        try {
          const parsedChunk = JSON.parse(chunk);
          if (parsedChunk.choices && parsedChunk.choices[0]?.delta?.content) {
            fullText += parsedChunk.choices[0].delta.content;
            setResponse(fullText);
          }
        } catch (err) {
          console.error("Error parsing stream:", err);
        }
      }
    } else {
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "Error fetching response");
    }

    setLoading(false);
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
        <h2 className="text-xl font-bold">Playground</h2>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="border p-2 rounded">
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        {/* Response Panel */}
        <div className="flex-1 bg-white shadow-md rounded p-4 mt-4">
          {response ? <div className="p-4 border rounded bg-gray-100">{response}</div> : <p className="text-gray-400 text-center">Enter a prompt to get started.</p>}
        </div>

        {/* Parameters Panel */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col bg-white p-4 rounded shadow-md">
          <h3 className="font-bold mb-2">Parameters</h3>
          <label>Temperature: <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} /></label>
          <label>Max Completion Tokens: <input type="number" min="1" max="4096" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} /></label>
          <label>Stream: <input type="checkbox" checked={stream} onChange={() => setStream(!stream)} /></label>
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded" disabled={loading}>{loading ? "Generating..." : "Submit"}</button>
        </form>
      </div>
    </div>
  );
}
