// "use client";

// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { useEffect, useRef, useState } from "react";
// import { useSse } from "@/hooks/useSse";
// import { useAudio } from "@/hooks/useAudio";
// import { GridBeams } from "@/components/grid-beams";
// import { Bot, Settings, X, Check } from "lucide-react";

// // Helper function to convert Base64 to ArrayBuffer
// function base64ToArrayBuffer(base64: string) {
//   const binaryString = window.atob(base64);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes.buffer;
// }

// // Helper function to convert ArrayBuffer to Base64
// function arrayBufferToBase64(buffer: ArrayBuffer) {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   const len = bytes.byteLength;
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return window.btoa(binary);
// }

// // Merge incremental text chunks from SSE without duplicating content
// function mergeStreamingText(existing: string, incoming: string): string {
//   if (!existing) return incoming;
//   if (!incoming) return existing;
//   // If server sends cumulative snapshots, prefer the latest snapshot
//   if (incoming.startsWith(existing)) return incoming;
//   // If the incoming chunk is already contained, ignore
//   if (existing.includes(incoming)) return existing;
//   // Merge with maximal overlap between the suffix of existing and prefix of incoming
//   const maxOverlap = Math.min(existing.length, incoming.length);
//   let overlap = 0;
//   for (let i = 1; i <= maxOverlap; i++) {
//     if (existing.slice(-i) === incoming.slice(0, i)) overlap = i;
//   }
//   return existing + incoming.slice(overlap);
// }

// export default function Home() {
//   type ChatMessage = {
//     id: string;
//     role: "user" | "assistant";
//     content: string;
//   };
//   const [sessionId] = useState(Math.random().toString().substring(10));
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [message, setMessage] = useState("");
//   const [isAudio, setIsAudio] = useState(false);
//   const [sseEnabled, setSseEnabled] = useState(true);
//   const [showSettings, setShowSettings] = useState(false);
//   const [serverUrl, setServerUrl] = useState(() => {
//     if (typeof window !== "undefined") {
//       return localStorage.getItem("sse-server-url") || "localhost:8000";
//     }
//     return "localhost:8000";
//   });
//   const [tempUrl, setTempUrl] = useState(serverUrl);
//   const {
//     lastMessage: lastSseMessage,
//     isConnected,
//     connectionError,
//   } = useSse(sessionId, isAudio, sseEnabled, serverUrl);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const handleAudioData = (data: ArrayBuffer) => {
//     sendMessage(arrayBufferToBase64(data), "audio/pcm");
//   };

//   const { startAudio, stopAudio, isAudioStarted, playAudio } =
//     useAudio(handleAudioData);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (lastSseMessage) {
//       if (lastSseMessage.mime_type === "text/plain") {
//         const chunk = String(lastSseMessage.data ?? "");
//         setMessages((previousMessages) => {
//           const nextMessages = [...previousMessages];
//           const last = nextMessages[nextMessages.length - 1];
//           if (!last || last.role !== "assistant") {
//             nextMessages.push({
//               id: generateId(),
//               role: "assistant",
//               content: chunk,
//             });
//           } else {
//             last.content = mergeStreamingText(last.content, chunk);
//             nextMessages[nextMessages.length - 1] = { ...last };
//           }
//           return nextMessages;
//         });
//       } else if (lastSseMessage.mime_type === "audio/pcm") {
//         playAudio(base64ToArrayBuffer(lastSseMessage.data));
//       }
//     }
//   }, [lastSseMessage, playAudio]);

//   const sendMessage = async (data: string, mimeType: string) => {
//     try {
//       await fetch(`http://${serverUrl}/send/${sessionId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           mime_type: mimeType,
//           data: data,
//         }),
//       });
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (message.trim() !== "") {
//       const userMessage: ChatMessage = {
//         id: generateId(),
//         role: "user",
//         content: message,
//       };
//       const assistantPlaceholder: ChatMessage = {
//         id: generateId(),
//         role: "assistant",
//         content: "",
//       };
//       setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
//       sendMessage(message, "text/plain");
//       setMessage("");
//     }
//   };

//   const handleStartAudio = () => {
//     setIsAudio(true);
//     startAudio();
//   };

//   const handleToggleSse = () => {
//     setSseEnabled((v) => !v);
//   };

//   const handleSaveSettings = () => {
//     setServerUrl(tempUrl);
//     localStorage.setItem("sse-server-url", tempUrl);
//     setShowSettings(false);
//   };

//   const handleCancelSettings = () => {
//     setTempUrl(serverUrl);
//     setShowSettings(false);
//   };

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("sse-server-url", serverUrl);
//     }
//   }, [serverUrl]);

//   return (
//     <GridBeams className="h-screen w-full">
//       <div className="font-sans flex flex-col h-screen w-full overflow-hidden">
//         <header className="sticky top-0 z-50 w-full flex items-center justify-between p-4 bg-black/30 backdrop-blur-xl border-b border-white/15">
//           <div className="flex items-center gap-3 text-white rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_30px_-10px_rgba(0,0,0,0.7)]">
//             <Bot className="size-6 text-white" />
//             <span className="text-lg font-semibold text-white">
//               Voice Agent
//             </span>
//           </div>
//           <div className="relative">
//             <Button
//               size="sm"
//               variant="ghost"
//               onClick={() => setShowSettings(!showSettings)}
//               className="text-white hover:bg-white/15 border border-white/20 backdrop-blur-xl h-9 w-9 p-0"
//             >
//               <Settings className="size-4" />
//             </Button>
//             {showSettings && (
//               <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[90vw] p-3 sm:p-4 bg-black/85 backdrop-blur-xl border border-white/25 rounded-xl shadow-2xl z-50">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-semibold text-white">Settings</h3>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={handleCancelSettings}
//                     className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
//                   >
//                     <X className="size-3" />
//                   </Button>
//                 </div>
//                 <div className="space-y-3">
//                   <div>
//                     <label className="text-xs text-white/80 block mb-1">
//                       Server URL
//                     </label>
//                     <Input
//                       value={tempUrl}
//                       onChange={(e) => setTempUrl(e.target.value)}
//                       placeholder="localhost:8000"
//                       className="bg-white/5 border-white/20 text-white placeholder:text-white/50 text-sm w-full"
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       onClick={handleSaveSettings}
//                       className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/25 h-8"
//                     >
//                       <Check className="size-3 mr-1" />
//                       Save
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={handleCancelSettings}
//                       className="text-white/80 hover:text-white hover:bg-white/15 h-8"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </header>
//         <main className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 pt-4 overflow-hidden">
//           <Card className="w-full max-w-4xl mx-auto flex-1 flex flex-col border-white/25 bg-white/12 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_20px_60px_-20px_rgba(0,0,0,0.7)]">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-white font-semibold">
//                   ADK Streaming Test
//                 </CardTitle>
//                 <div className="flex items-center gap-2">
//                   <Badge
//                     variant={isConnected ? "secondary" : "destructive"}
//                     className={`backdrop-blur-md border text-white font-medium ${
//                       isConnected
//                         ? "bg-green-500/20 border-green-400/40 text-green-100"
//                         : "bg-red-500/20 border-red-400/40 text-red-100"
//                     }`}
//                   >
//                     {isConnected ? "Connected" : "Disconnected"}
//                   </Badge>
//                   <Button
//                     type="button"
//                     size="sm"
//                     variant={isConnected ? "destructive" : "secondary"}
//                     onClick={handleToggleSse}
//                     className={`backdrop-blur-md border text-white font-medium h-8 ${
//                       isConnected
//                         ? "bg-red-500/20 border-red-400/40 hover:bg-red-500/30 text-red-100"
//                         : "bg-blue-500/20 border-blue-400/40 hover:bg-blue-500/30 text-blue-100"
//                     }`}
//                   >
//                     {isConnected ? "Disconnect" : "Connect"}
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="flex-1 flex flex-col overflow-hidden">
//               {connectionError && (
//                 <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-100 text-sm backdrop-blur-md">
//                   <div className="font-medium mb-1">Connection Error</div>
//                   <div className="text-red-200/90">{connectionError}</div>
//                 </div>
//               )}
//               <div className="flex-1 min-h-0 overflow-y-auto border border-white/20 rounded-xl p-4 space-y-3 bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
//                 {messages.map((msg) => (
//                   <div
//                     key={msg.id}
//                     className={`flex ${
//                       msg.role === "user" ? "justify-end" : "justify-start"
//                     }`}
//                   >
//                     <div
//                       className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words border backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_-15px_rgba(0,0,0,0.6)] ${
//                         msg.role === "user"
//                           ? "bg-[linear-gradient(180deg,rgba(59,130,246,0.35),rgba(59,130,246,0.18))] border-blue-400/50 text-blue-50"
//                           : "bg-[linear-gradient(180deg,rgba(75,85,99,0.35),rgba(75,85,99,0.18))] border-gray-400/40 text-gray-50"
//                       }`}
//                     >
//                       {msg.content}
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>

//               <Separator className="my-4 bg-white/20" />

//               <form
//                 onSubmit={handleSendMessage}
//                 className="flex flex-col gap-2"
//               >
//                 <Textarea
//                   placeholder="Type your message..."
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   className="min-h-[84px] rounded-2xl border-white/25 bg-white/8 backdrop-blur-md placeholder:text-white/70 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] focus:border-white/40 focus:bg-white/10"
//                 />
//                 <div className="flex items-center gap-2 flex-wrap justify-start">
//                   <Button
//                     type="submit"
//                     disabled={!isConnected || message.trim() === ""}
//                     className="backdrop-blur-md border-blue-400/40 bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 disabled:opacity-50 disabled:bg-white/10 disabled:border-white/20 disabled:text-white/60 h-9 font-medium"
//                   >
//                     Send
//                   </Button>
//                   <Button
//                     type="button"
//                     onClick={handleStartAudio}
//                     disabled={isAudioStarted}
//                     className="backdrop-blur-md border-green-400/40 bg-green-500/20 hover:bg-green-500/30 text-green-100 disabled:opacity-50 disabled:bg-white/10 disabled:border-white/20 disabled:text-white/60 h-9 font-medium"
//                   >
//                     Start Audio
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     onClick={() => {
//                       setIsAudio(false);
//                       stopAudio();
//                     }}
//                     disabled={!isAudioStarted}
//                     className="backdrop-blur-md border-orange-400/40 bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 disabled:opacity-50 disabled:bg-white/10 disabled:border-white/20 disabled:text-white/60 h-9 font-medium"
//                   >
//                     Stop Audio
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </main>
//         <div className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 pt-2 sm:pt-4 flex-shrink-0">
//           <footer className="w-full flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-white/90 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl px-3 sm:px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] gap-2 sm:gap-0">
//             <div className="flex flex-row items-center gap-2 sm:gap-4">
//               <div className="flex items-center gap-1 sm:gap-2">
//                 <span
//                   aria-hidden="true"
//                   className="text-sm sm:text-lg text-white/90"
//                 >
//                   ©
//                 </span>
//                 <span className="text-white whitespace-nowrap font-medium">
//                   Weights &amp; Biases
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-row items-center gap-2 sm:gap-4">
//               <div className="text-white/90 whitespace-nowrap">MIT License</div>
//               <a
//                 href="https://github.com/wandb/voice-ai-agent-workshop"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="hover:underline hover:underline-offset-4 text-white/90 hover:text-white whitespace-nowrap transition-colors"
//               >
//                 Source code
//               </a>
//             </div>
//           </footer>
//         </div>
//       </div>
//     </GridBeams>
//   );
// }

// function generateId(): string {
//   try {
//     if (typeof crypto !== "undefined" && crypto.randomUUID)
//       return crypto.randomUUID();
//   } catch {}
//   return Math.random().toString(36).slice(2);
// }




// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Bot, Settings, X, Check, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { useSse } from "@/hooks/useSse";
// import { useAudio } from "@/hooks/useAudio";

// /* Helper Functions */
// function base64ToArrayBuffer(base64: string) {
//   const binaryString = window.atob(base64);
//   const bytes = new Uint8Array(binaryString.length);
//   for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
//   return bytes.buffer;
// }
// function arrayBufferToBase64(buffer: ArrayBuffer) {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
//   return window.btoa(binary);
// }
// function mergeStreamingText(existing: string, incoming: string): string {
//   if (!existing) return incoming;
//   if (!incoming) return existing;
//   if (incoming.startsWith(existing)) return incoming;
//   if (existing.includes(incoming)) return existing;
//   const maxOverlap = Math.min(existing.length, incoming.length);
//   let overlap = 0;
//   for (let i = 1; i <= maxOverlap; i++) {
//     if (existing.slice(-i) === incoming.slice(0, i)) overlap = i;
//   }
//   return existing + incoming.slice(overlap);
// }
// function generateId(): string {
//   try {
//     if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
//   } catch {}
//   return Math.random().toString(36).slice(2);
// }

// export default function Home() {
//   type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

//   const [sessionId] = useState(Math.random().toString().substring(10));
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [message, setMessage] = useState("");
//   const [isAudio, setIsAudio] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [serverUrl, setServerUrl] = useState(
//     typeof window !== "undefined"
//       ? localStorage.getItem("sse-server-url") || "localhost:8000"
//       : "localhost:8000"
//   );
//   const [tempUrl, setTempUrl] = useState(serverUrl);

//   const { lastMessage: lastSseMessage, isConnected } = useSse(
//     sessionId,
//     isAudio,
//     true,
//     serverUrl
//   );

//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [isScrolledUp, setIsScrolledUp] = useState(false);

//   const { startAudio, stopAudio, isAudioStarted, playAudio } = useAudio((data) =>
//     sendMessage(arrayBufferToBase64(data), "audio/pcm")
//   );

//   /* Scroll on assistant messages */
//   useEffect(() => {
//     const last = messages[messages.length - 1];
//     if (last?.role === "assistant") {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   /* Scroll detection for floating button */
//   useEffect(() => {
//     const el = chatContainerRef.current;
//     if (!el) return;
//     const handleScroll = () => {
//       const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
//       setIsScrolledUp(!isAtBottom);
//     };
//     el.addEventListener("scroll", handleScroll);
//     return () => el.removeEventListener("scroll", handleScroll);
//   }, []);

//   /* Handle incoming SSE chunks */
//   useEffect(() => {
//     if (!lastSseMessage) return;

//     if (lastSseMessage.mime_type === "text/plain") {
//       const chunk = String(lastSseMessage.data ?? "");
//       setMessages((prev) => {
//         const next = [...prev];
//         const last = next[next.length - 1];
//         if (!last || last.role !== "assistant") {
//           next.push({ id: generateId(), role: "assistant", content: chunk });
//         } else {
//           last.content = mergeStreamingText(last.content, chunk);
//           next[next.length - 1] = { ...last };
//         }
//         return next;
//       });
//     } else if (lastSseMessage.mime_type === "audio/pcm") {
//       playAudio(base64ToArrayBuffer(lastSseMessage.data));
//     }
//   }, [lastSseMessage, playAudio]);

//   async function sendMessage(data: string, mimeType: string) {
//     try {
//       await fetch(`http://${serverUrl}/send/${sessionId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mime_type: mimeType, data }),
//       });
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   }

//   function handleSendMessage(e: React.FormEvent<HTMLFormElement> | any) {
//     e.preventDefault();
//     if (!message.trim()) return;
//     const userMsg: ChatMessage = { id: generateId(), role: "user", content: message };
//     const botMsg: ChatMessage = { id: generateId(), role: "assistant", content: "" };
//     setMessages((prev) => [...prev, userMsg, botMsg]);
//     sendMessage(message, "text/plain");
//     setMessage("");
//   }

//   return (
//     <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white font-sans overflow-hidden">
//       {/* Ambient glows */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.25),transparent_60%)] blur-3xl animate-pulse" />

//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-5 py-3 backdrop-blur-md bg-black/40 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <div className="neon-pill">
//             <Bot className="size-5" />
//           </div>
//           <h1 className="text-lg font-semibold gradient-text">Voice AI Agent</h1>
//         </div>
//         <div className="flex items-center gap-3">
//           <Badge
//             className={`!rounded-full px-3 py-1 text-xs border ${
//               isConnected
//                 ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
//                 : "bg-rose-500/15 border-rose-400/50 text-rose-300"
//             }`}
//           >
//             {isConnected ? "Connected" : "Disconnected"}
//           </Badge>
//           <button
//             onClick={() => setShowSettings((s) => !s)}
//             className="btn btn-ghost btn-slide"
//           >
//             <Settings className="size-4" />
//             <span className="ml-2">Settings</span>
//           </button>
//         </div>

//         {showSettings && (
//           <div className="absolute right-4 top-14 w-80 p-4 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl z-50">
//             <div className="flex justify-between mb-3">
//               <h3 className="text-white/90 font-medium">Settings</h3>
//               <button onClick={() => setShowSettings(false)} className="btn btn-icon btn-ghost">
//                 <X className="size-4" />
//               </button>
//             </div>
//             <Input
//               value={tempUrl}
//               onChange={(e) => setTempUrl(e.target.value)}
//               className="bg-white/5 border-white/15 text-white mb-3"
//               placeholder="localhost:8000"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={() => {
//                   setServerUrl(tempUrl);
//                   localStorage.setItem("sse-server-url", tempUrl);
//                   setShowSettings(false);
//                 }}
//                 className="btn btn-primary btn-slide flex-1"
//               >
//                 <Check className="size-4 mr-2" /> Save
//               </button>
//               <button onClick={() => setShowSettings(false)} className="btn btn-ghost flex-1">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Chat Section */}
//       <main className="flex-1 pt-[70px] pb-[110px] px-4 flex flex-col overflow-hidden">
//         <Card className="flex flex-col flex-1 min-h-0 bg-white/10 border-white/15 backdrop-blur-xl rounded-2xl">

//           <CardHeader>
//             <CardTitle className="text-white font-semibold">Conversation</CardTitle>
//           </CardHeader>

//           <CardContent
//             ref={chatContainerRef}
//             className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar"
//           >
//             {messages.length === 0 && (
//               <div className="text-center text-white/70 mt-10">
//                 <Bot className="mx-auto mb-3 opacity-60" />
//                 <p>
//                   Ask me anything! Try{" "}
//                   <span className="text-pink-400">“explain voice chart”</span> or{" "}
//                   <span className="text-indigo-400">start speaking</span> using Start Audio.
//                 </p>
//               </div>
//             )}

//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`message-bubble ${
//                     msg.role === "user" ? "bubble-user" : "bubble-bot"
//                   }`}
//                 >
//                   {msg.content}
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </CardContent>

//           {isScrolledUp && (
//             <button
//               onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
//               className="absolute bottom-[130px] right-8 btn btn-primary btn-icon shadow-xl"
//             >
//               <ChevronDown className="size-4" />
//             </button>
//           )}

//           <Separator className="bg-white/10" />

//           {/* Input Section */}
//           <form onSubmit={handleSendMessage} className="p-4 flex flex-col gap-3">
//             <Textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   if (message.trim()) handleSendMessage(e);
//                 }
//               }}
//               placeholder="Type your message..."
//               className="bg-white/5 text-white placeholder:text-white/60 border-white/15 rounded-xl resize-none min-h-[80px]"
//             />
//             <p className="text-xs text-white/50 ml-1">
//               Press <span className="text-white/70 font-medium">Enter</span> to send •{" "}
//               <span className="text-white/70 font-medium">Shift + Enter</span> for a new line
//             </p>
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <Button
//                 type="submit"
//                 disabled={!isConnected || message.trim() === ""}
//                 className="btn btn-primary btn-slide"
//               >
//                 Send
//               </Button>
//               <div className="flex gap-3">
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsAudio(true);
//                     startAudio();
//                   }}
//                   disabled={isAudioStarted}
//                   className="btn btn-success btn-slide"
//                 >
//                   Start Audio
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsAudio(false);
//                     stopAudio();
//                   }}
//                   disabled={!isAudioStarted}
//                   className="btn btn-danger btn-slide"
//                 >
//                   Stop Audio
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </Card>
//       </main>

//       {/* Footer */}
//       <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center py-3 text-xs text-white/80 backdrop-blur-md bg-black/40 border-t border-white/10">
//         ✨ Built with <span className="text-pink-400 mx-1 font-semibold">love</span> by{" "}
//         <span className="gradient-text font-semibold">Voice Agent</span>
//       </footer>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Bot, Settings, X, Check, ChevronDown } from "lucide-react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { useSse } from "@/hooks/useSse";
// import { useAudio } from "@/hooks/useAudio";

// /* Helper Functions */
// function base64ToArrayBuffer(base64: string) {
//   const binaryString = window.atob(base64);
//   const bytes = new Uint8Array(binaryString.length);
//   for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
//   return bytes.buffer;
// }
// function arrayBufferToBase64(buffer: ArrayBuffer) {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
//   return window.btoa(binary);
// }
// function mergeStreamingText(existing: string, incoming: string): string {
//   if (!existing) return incoming;
//   if (!incoming) return existing;
//   if (incoming.startsWith(existing)) return incoming;
//   if (existing.includes(incoming)) return existing;
//   const maxOverlap = Math.min(existing.length, incoming.length);
//   let overlap = 0;
//   for (let i = 1; i <= maxOverlap; i++) {
//     if (existing.slice(-i) === incoming.slice(0, i)) overlap = i;
//   }
//   return existing + incoming.slice(overlap);
// }
// function generateId(): string {
//   try {
//     if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
//   } catch {}
//   return Math.random().toString(36).slice(2);
// }

// export default function Home() {
//   type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

//   const [sessionId] = useState(Math.random().toString().substring(10));
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [message, setMessage] = useState("");
//   const [isAudio, setIsAudio] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [serverUrl, setServerUrl] = useState(
//     typeof window !== "undefined"
//       ? localStorage.getItem("sse-server-url") || "localhost:8000"
//       : "localhost:8000"
//   );
//   const [tempUrl, setTempUrl] = useState(serverUrl);

//   const { lastMessage: lastSseMessage, isConnected } = useSse(sessionId, isAudio, true, serverUrl);

//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [isScrolledUp, setIsScrolledUp] = useState(false);

//   const { startAudio, stopAudio, isAudioStarted, playAudio } = useAudio((data) =>
//     sendMessage(arrayBufferToBase64(data), "audio/pcm")
//   );

//   /* Scroll behavior */
//   useEffect(() => {
//     const el = chatContainerRef.current;
//     if (!el) return;
//     const handleScroll = () => {
//       const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
//       setIsScrolledUp(!isAtBottom);
//     };
//     el.addEventListener("scroll", handleScroll);
//     return () => el.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   /* SSE message handling */
//   useEffect(() => {
//     if (!lastSseMessage) return;

//     if (lastSseMessage.mime_type === "text/plain") {
//       const chunk = String(lastSseMessage.data ?? "");
//       setMessages((prev) => {
//         const next = [...prev];
//         const last = next[next.length - 1];
//         if (!last || last.role !== "assistant") {
//           next.push({ id: generateId(), role: "assistant", content: chunk });
//         } else {
//           last.content = mergeStreamingText(last.content, chunk);
//           next[next.length - 1] = { ...last };
//         }
//         return next;
//       });
//     } else if (lastSseMessage.mime_type === "audio/pcm") {
//       playAudio(base64ToArrayBuffer(lastSseMessage.data));
//     }
//   }, [lastSseMessage, playAudio]);

//   async function sendMessage(data: string, mimeType: string) {
//     try {
//       await fetch(`http://${serverUrl}/send/${sessionId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mime_type: mimeType, data }),
//       });
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   }

//   function handleSendMessage(e?: React.FormEvent<HTMLFormElement>) {
//     e?.preventDefault();
//     if (!message.trim()) return;
//     const userMsg: ChatMessage = { id: generateId(), role: "user", content: message };
//     const botMsg: ChatMessage = { id: generateId(), role: "assistant", content: "" };
//     setMessages((prev) => [...prev, userMsg, botMsg]);
//     sendMessage(message, "text/plain");
//     setMessage("");
//   }

//   /* Allow Enter to send */
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white font-sans overflow-hidden">
//       {/* Ambient background */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.25),transparent_60%)] blur-3xl animate-pulse" />

//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-5 py-3 backdrop-blur-md bg-black/40 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <div className="neon-pill">
//             <Bot className="size-5" />
//           </div>
//           <h1 className="text-lg font-semibold gradient-text">Voice AI Agent</h1>
//         </div>

//         <div className="flex items-center gap-3">
//           <Badge
//             className={`!rounded-full px-3 py-1 text-xs border ${
//               isConnected
//                 ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
//                 : "bg-rose-500/15 border-rose-400/50 text-rose-300"
//             }`}
//           >
//             {isConnected ? "Connected" : "Disconnected"}
//           </Badge>
//           <button onClick={() => setShowSettings((s) => !s)} className="btn btn-ghost btn-slide">
//             <Settings className="size-4" />
//             <span className="ml-2">Settings</span>
//           </button>
//         </div>

//         {showSettings && (
//           <div className="absolute right-4 top-14 w-80 p-4 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl z-50">
//             <div className="flex justify-between mb-3">
//               <h3 className="text-white/90 font-medium">Settings</h3>
//               <button onClick={() => setShowSettings(false)} className="btn btn-icon btn-ghost">
//                 <X className="size-4" />
//               </button>
//             </div>
//             <Input
//               value={tempUrl}
//               onChange={(e) => setTempUrl(e.target.value)}
//               className="bg-white/5 border-white/15 text-white mb-3"
//               placeholder="localhost:8000"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={() => {
//                   setServerUrl(tempUrl);
//                   localStorage.setItem("sse-server-url", tempUrl);
//                   setShowSettings(false);
//                 }}
//                 className="btn btn-primary btn-slide flex-1"
//               >
//                 <Check className="size-4 mr-2" /> Save
//               </button>
//               <button onClick={() => setShowSettings(false)} className="btn btn-ghost flex-1">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Chat Section */}
//       <main className="flex-1 pt-[70px] pb-[110px] px-4 flex flex-col">
//         <Card className="flex flex-col flex-1 bg-white/10 border-white/15 backdrop-blur-xl rounded-2xl overflow-hidden">
//           <CardHeader>
//             <CardTitle className="text-white font-semibold">Conversation</CardTitle>
//           </CardHeader>

//           <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar">
//             {messages.length === 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8 }}
//                 className="flex flex-col items-center text-center mt-20 space-y-4"
//               >
//                 <div className="neon-pill animate-pulse shadow-lg shadow-pink-500/20">
//                   <Bot className="size-6" />
//                 </div>
//                 <h2 className="text-2xl font-semibold gradient-text animate-pulse">Ask me anything!</h2>
//                 <p className="text-sm text-white/80 leading-relaxed max-w-lg">
//                   Try{" "}
//                   <span className="font-medium text-pink-400">“explain voice chart”</span> or start
//                   speaking using{" "}
//                   <span className="font-medium text-indigo-400">Start Audio</span>.
//                 </p>
//                 <motion.div
//                   className="w-32 h-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full"
//                   initial={{ width: 0, opacity: 0 }}
//                   animate={{ width: "8rem", opacity: 1 }}
//                   transition={{ delay: 0.6, duration: 0.8 }}
//                 />
//               </motion.div>
//             )}

//             {messages.map((msg, index) => (
//               <motion.div
//                 key={msg.id}
//                 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: index * 0.05 }}
//               >
//                 <motion.div
//                   className={`message-bubble ${
//                     msg.role === "user" ? "bubble-user" : "bubble-bot"
//                   }`}
//                   initial={{ scale: 0.95, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {msg.content}
//                 </motion.div>
//               </motion.div>
//             ))}
//             <div ref={messagesEndRef} />
//           </CardContent>

//           {isScrolledUp && (
//             <button
//               onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
//               className="absolute bottom-[130px] right-8 btn btn-primary btn-icon shadow-xl"
//             >
//               <ChevronDown className="size-4" />
//             </button>
//           )}

//           <Separator className="bg-white/10" />

//           {/* Input Section */}
//           <form onSubmit={handleSendMessage} className="p-4 flex flex-col gap-3">
//             <Textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type your message... (Press Enter to send)"
//               className="bg-white/5 text-white placeholder:text-white/60 border-white/15 rounded-xl resize-none min-h-[80px]"
//             />
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <Button
//                 type="submit"
//                 disabled={!isConnected || message.trim() === ""}
//                 className="btn btn-primary btn-slide"
//               >
//                 Send
//               </Button>
//               <div className="flex gap-3">
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsAudio(true);
//                     startAudio();
//                   }}
//                   disabled={isAudioStarted}
//                   className="btn btn-success btn-slide"
//                 >
//                   Start Audio
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsAudio(false);
//                     stopAudio();
//                   }}
//                   disabled={!isAudioStarted}
//                   className="btn btn-danger btn-slide"
//                 >
//                   Stop Audio
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </Card>
//       </main>

//       {/* Footer */}
//       <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center py-3 text-xs text-white/80 backdrop-blur-md bg-black/40 border-t border-white/10">
//         ✨ Built with <span className="text-pink-400 mx-1 font-semibold">love</span> by{" "}
//         <span className="gradient-text font-semibold">Voice Agent</span>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Settings, X, Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSse } from "@/hooks/useSse";
import { useAudio } from "@/hooks/useAudio";

/* Helper Functions */
function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}
function mergeStreamingText(existing: string, incoming: string): string {
  if (!existing) return incoming;
  if (!incoming) return existing;
  if (incoming.startsWith(existing)) return incoming;
  if (existing.includes(incoming)) return existing;
  const maxOverlap = Math.min(existing.length, incoming.length);
  let overlap = 0;
  for (let i = 1; i <= maxOverlap; i++) {
    if (existing.slice(-i) === incoming.slice(0, i)) overlap = i;
  }
  return existing + incoming.slice(overlap);
}
function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

  const [sessionId] = useState(Math.random().toString().substring(10));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isAudio, setIsAudio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("sse-server-url") || "localhost:8000"
      : "localhost:8000"
  );
  const [tempUrl, setTempUrl] = useState(serverUrl);

  const { lastMessage: lastSseMessage, isConnected } = useSse(sessionId, isAudio, true, serverUrl);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const { startAudio, stopAudio, isAudioStarted, playAudio } = useAudio((data) =>
    sendMessage(arrayBufferToBase64(data), "audio/pcm")
  );

  /* Scroll behavior */
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      setIsScrolledUp(!isAtBottom);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* Auto-scroll on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Handle incoming SSE chunks */
  useEffect(() => {
    if (!lastSseMessage) return;

    if (lastSseMessage.mime_type === "text/plain") {
      const chunk = String(lastSseMessage.data ?? "");
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (!last || last.role !== "assistant") {
          next.push({ id: generateId(), role: "assistant", content: chunk });
        } else {
          last.content = mergeStreamingText(last.content, chunk);
          next[next.length - 1] = { ...last };
        }
        return next;
      });
    } else if (lastSseMessage.mime_type === "audio/pcm") {
      playAudio(base64ToArrayBuffer(lastSseMessage.data));
    }
  }, [lastSseMessage, playAudio]);

  async function sendMessage(data: string, mimeType: string) {
    try {
      await fetch(`http://${serverUrl}/send/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime_type: mimeType, data }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  function handleSendMessage(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!message.trim()) return;
    const userMsg: ChatMessage = { id: generateId(), role: "user", content: message };
    const botMsg: ChatMessage = { id: generateId(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    sendMessage(message, "text/plain");
    setMessage("");
  }

  /* Allow Enter to send */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white font-sans overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.25),transparent_60%)] blur-3xl animate-pulse" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-5 py-3 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="neon-pill">
            <Bot className="size-5" />
          </div>
          <h1 className="text-lg font-semibold gradient-text">Voice AI Agent</h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={`!rounded-full px-3 py-1 text-xs border ${
              isConnected
                ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                : "bg-rose-500/15 border-rose-400/50 text-rose-300"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <button onClick={() => setShowSettings((s) => !s)} className="btn btn-ghost btn-slide">
            <Settings className="size-4" />
            <span className="ml-2">Settings</span>
          </button>
        </div>

        {showSettings && (
          <div className="absolute right-4 top-14 w-80 p-4 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl z-50">
            <div className="flex justify-between mb-3">
              <h3 className="text-white/90 font-medium">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="btn btn-icon btn-ghost">
                <X className="size-4" />
              </button>
            </div>
            <Input
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="bg-white/5 border-white/15 text-white mb-3"
              placeholder="localhost:8000"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setServerUrl(tempUrl);
                  localStorage.setItem("sse-server-url", tempUrl);
                  setShowSettings(false);
                }}
                className="btn btn-primary btn-slide flex-1"
              >
                <Check className="size-4 mr-2" /> Save
              </button>
              <button onClick={() => setShowSettings(false)} className="btn btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Chat Section */}
      <main className="flex-1 pt-[70px] pb-[110px] px-4 flex flex-col overflow-hidden">
        <Card className="flex flex-col flex-1 bg-white/10 border-white/15 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-white font-semibold">Conversation</CardTitle>
          </CardHeader>

          {/* Scrollable Chat */}
          <CardContent
            ref={chatContainerRef}
            className="flex-1 min-h-0 overflow-y-auto space-y-3 p-4 custom-scrollbar"
          >
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center text-center mt-20 space-y-4"
              >
                <div className="neon-pill animate-pulse shadow-lg shadow-pink-500/20">
                  <Bot className="size-6" />
                </div>
                <h2 className="text-2xl font-semibold gradient-text animate-pulse">
                  Ask me anything!
                </h2>
                <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                  Try{" "}
                  <span className="font-medium text-pink-400">“explain voice chart”</span> or start
                  speaking using{" "}
                  <span className="font-medium text-indigo-400">Start Audio</span>.
                </p>
                <motion.div
                  className="w-32 h-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "8rem", opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </motion.div>
            )}

            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <motion.div
                  className={`message-bubble ${
                    msg.role === "user" ? "bubble-user" : "bubble-bot"
                  }`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.content}
                </motion.div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {isScrolledUp && (
            <button
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="absolute bottom-[130px] right-8 btn btn-primary btn-icon shadow-xl"
            >
              <ChevronDown className="size-4" />
            </button>
          )}

          {/* Input Section */}
          <Separator className="bg-white/10 flex-shrink-0" />
          <form
            onSubmit={handleSendMessage}
            className="p-4 flex flex-col gap-3 bg-white/5 backdrop-blur-md"
          >
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send)"
              className="bg-white/5 text-white placeholder:text-white/60 border-white/15 rounded-xl resize-none min-h-[80px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="submit"
                disabled={!isConnected || message.trim() === ""}
                className="btn btn-primary btn-slide"
              >
                Send
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setIsAudio(true);
                    startAudio();
                  }}
                  disabled={isAudioStarted}
                  className="btn btn-success btn-slide"
                >
                  Start Audio
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsAudio(false);
                    stopAudio();
                  }}
                  disabled={!isAudioStarted}
                  className="btn btn-danger btn-slide"
                >
                  Stop Audio
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center py-3 text-xs text-white/80 backdrop-blur-md bg-black/40 border-t border-white/10">
        ✨ Built with <span className="text-pink-400 mx-1 font-semibold">love</span> by{" "}
        <span className="gradient-text font-semibold">Voice Agent</span>
      </footer>
    </div>
  );
}
