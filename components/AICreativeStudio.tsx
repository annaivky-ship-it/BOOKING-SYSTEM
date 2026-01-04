
import React, { useState, useRef } from 'react';
import { Wand2, ScanSearch, Ratio, Send, LoaderCircle, Sparkles, Image as ImageIcon, Check, X, AlertCircle, ShieldAlert, Download, Share2, UploadCloud, FileImage, RefreshCcw, FileUp } from 'lucide-react';
import { geminiService, AspectRatio } from '../services/geminiService';

interface AICreativeStudioProps {
  onBack: () => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "Square", icon: "▢" },
  { value: "3:4", label: "Portrait", icon: "▯" },
  { value: "4:3", label: "Standard", icon: "▭" },
  { value: "9:16", label: "Story", icon: "📱" },
  { value: "16:9", label: "Cinema", icon: "🎬" },
];

const AICreativeStudio: React.FC<AICreativeStudioProps> = ({ onBack }) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenApiKeySelector = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await geminiService.generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      if (err.message?.includes("API KEY ERROR") || err.message?.includes("Requested entity was not found")) {
        setError("A paid provider key is required to create high-quality images.");
        await handleOpenApiKeySelector();
      } else {
        setError(err.message || "We couldn't create your image right now. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisImage) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await geminiService.analyzeImage(analysisImage, "image/jpeg");
      setAnalysisResult(result || "The review didn't return any specific feedback.");
    } catch (err: any) {
      setError("We couldn't review this photo. Please try another one.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-12 py-6 px-4 md:px-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12 relative">
        <div className="space-y-4">
          <button onClick={onBack} className="group text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 mb-2">
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Dashboard
          </button>
          <h1 className="text-6xl md:text-8xl font-logo-main text-white tracking-tighter uppercase leading-[0.8] drop-shadow-[0_10px_30px_rgba(249,115,22,0.1)]">
            Creative <span className="text-orange-500">Studio</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-12 bg-orange-500 rounded-full"></div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Tools to improve your profile & photos</p>
          </div>
        </div>
        
        <button 
          onClick={handleOpenApiKeySelector}
          className="group bg-zinc-950/80 hover:bg-orange-500 hover:text-white border border-white/10 hover:border-orange-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-4 backdrop-blur-xl shadow-2xl"
        >
          <ShieldAlert size={16} className="text-orange-500 group-hover:text-white transition-colors" />
          Studio Connection: {process.env.API_KEY ? 'Ready' : 'Offline'}
        </button>
      </div>

      {/* Mode Navigation */}
      <div className="flex items-center gap-3 p-2 bg-zinc-950/60 rounded-[2.5rem] border border-white/5 w-fit mx-auto lg:mx-0 shadow-inner">
        <button
          onClick={() => setActiveMode('generate')}
          className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeMode === 'generate' ? 'bg-orange-500 text-white shadow-[0_15px_35px_-10px_rgba(249,115,22,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Wand2 size={20} /> Create Photos
        </button>
        <button
          onClick={() => setActiveMode('analyze')}
          className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeMode === 'analyze' ? 'bg-orange-500 text-white shadow-[0_15px_35px_-10px_rgba(249,115,22,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <ScanSearch size={20} /> Professional Feedback
        </button>
      </div>

      {error && (
        <div className="p-8 bg-red-950/30 border border-red-500/40 rounded-[2rem] flex items-start gap-6 animate-fade-in max-w-4xl mx-auto lg:mx-0 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <div className="space-y-2">
            <p className="text-red-200 text-xs font-black uppercase tracking-[0.2em]">Service Alert</p>
            <p className="text-red-400/80 text-sm font-medium leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Main Studio Viewport */}
      {activeMode === 'generate' ? (
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          <div className="space-y-8 animate-fade-in">
            <div className="card-base !p-12 !bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-2xl relative overflow-visible">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.5em] flex items-center gap-4">
                  <Sparkles size={20} /> Image Details
                </h3>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-950/80 px-4 py-1.5 rounded-full border border-white/5">High Quality Mode</span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the photo you want... e.g. 'Professional headshot, warm lighting, city background, stylish outfit, looking directly at camera'"
                className="input-base h-56 resize-none !text-lg !font-medium leading-relaxed !bg-zinc-950/80 !border-white/5 focus:!border-orange-500/50 transition-all placeholder:text-zinc-800 p-8 rounded-[2rem]"
              />
              
              <div className="mt-12 space-y-8">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
                        <Ratio size={18} className="text-orange-500" /> Size & Shape
                    </h4>
                </div>
                
                <div className="grid grid-cols-5 gap-4">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`group py-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${aspectRatio === ratio.value ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-zinc-950/50 border-white/5 text-zinc-700 hover:text-zinc-400 hover:bg-zinc-900'}`}
                    >
                      <span className="text-2xl leading-none group-hover:scale-110 transition-transform">{ratio.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{ratio.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="btn-primary w-full mt-12 !py-8 !text-sm font-black flex items-center justify-center gap-5 disabled:opacity-20 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isGenerating ? <LoaderCircle className="animate-spin relative z-10" size={24} strokeWidth={3} /> : <Wand2 size={24} className="group-hover:rotate-12 transition-transform relative z-10" />}
                <span className="relative z-10 tracking-[0.3em]">{isGenerating ? 'CREATING PHOTO...' : 'CREATE PHOTO'}</span>
              </button>
            </div>
          </div>

          {/* Visual Result Frame */}
          <div className="relative group min-h-[600px] h-full">
            <div className="absolute inset-0 bg-orange-500/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            {generatedImage ? (
              <div className="card-base !p-0 overflow-hidden bg-zinc-950 flex flex-col h-full border-white/10 animate-fade-in shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative z-10 group/result">
                <div className="relative flex-grow flex items-center justify-center p-6 bg-black/40">
                  <img src={generatedImage} alt="Created Image" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover/result:scale-[1.01]" />
                </div>
                <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row gap-6 bg-zinc-900/90 backdrop-blur-2xl">
                   <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `flavor-studio-${Date.now()}.png`;
                      link.click();
                    }}
                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 border border-white/5 shadow-xl"
                   >
                     <Download size={18}/> Save Photo
                   </button>
                   <button className="flex-1 py-5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 border border-orange-500/20 shadow-xl">
                     <Share2 size={18}/> Add to Profile
                   </button>
                </div>
              </div>
            ) : (
              <div className="card-base h-full border-dashed border-zinc-800 bg-zinc-950/40 flex flex-col items-center justify-center text-center p-20 relative z-10 group-hover:border-zinc-700 transition-colors">
                <div className="w-32 h-32 bg-zinc-900 rounded-[3rem] flex items-center justify-center mb-10 ring-1 ring-white/5 shadow-inner">
                  <ImageIcon size={48} className="text-zinc-800 animate-pulse" />
                </div>
                <h4 className="text-white font-black text-3xl uppercase tracking-tight mb-6">Your New Photo</h4>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                  The image you describe will appear here once created.
                </p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 z-30 bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in rounded-[1.5rem]">
                <div className="relative">
                   <div className="absolute inset-0 bg-orange-500/40 blur-[80px] animate-pulse"></div>
                   <LoaderCircle className="h-28 w-28 text-orange-500 animate-spin relative" strokeWidth={3} />
                </div>
                <p className="text-white font-black uppercase tracking-[0.8em] mt-12 text-sm ml-[0.8em]">Creating</p>
                <p className="text-orange-500/50 text-[10px] font-black uppercase tracking-[0.4em] mt-4 animate-pulse">Drawing your photo...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Professional Feedback View */
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          <div className="space-y-8 animate-fade-in">
            <div className="card-base !p-12 !bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.5em] flex items-center gap-4">
                  <ScanSearch size={20} /> Upload for Review
                </h3>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-950/80 px-4 py-1.5 rounded-full border border-white/5">Analysis: Professional Quality</span>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-80 bg-zinc-950/80 rounded-[2.5rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900 transition-all group overflow-hidden relative shadow-inner mb-6"
              >
                {analysisImage ? (
                  <>
                    <img src={analysisImage} alt="Photo to Review" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-1000" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/60 backdrop-blur-sm">
                      <RefreshCcw className="text-white mb-6 animate-spin-slow" size={56} strokeWidth={3} />
                      <span className="text-white text-[11px] font-black uppercase tracking-[0.5em] ml-[0.5em]">Replace Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-700 shadow-2xl border border-white/5">
                      <UploadCloud className="text-zinc-700 group-hover:text-orange-500 transition-colors" size={48} />
                    </div>
                    <div className="text-center px-12">
                      <p className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em] mb-3">Upload a profile photo</p>
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">Get tips on lighting and style</p>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-orange-500/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-4 group/upload"
                  >
                    <FileUp size={20} className="text-zinc-700 group-hover/upload:text-orange-500 transition-colors" />
                    {analysisImage ? 'Change Photo' : 'Select Photo from Device'}
                 </button>

                 <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !analysisImage}
                    className="btn-primary w-full !py-8 !text-sm font-black flex items-center justify-center gap-5 disabled:opacity-20 group mt-2"
                  >
                    {isAnalyzing ? <LoaderCircle className="animate-spin" size={24} strokeWidth={3} /> : <ScanSearch size={24} className="group-hover:scale-110 transition-transform" />}
                    <span className="tracking-[0.3em]">{isAnalyzing ? 'REVIEWING PHOTO...' : 'GET PROFESSIONAL FEEDBACK'}</span>
                  </button>
              </div>
            </div>
          </div>

          <div className="relative group h-full">
            <div className="absolute inset-0 bg-orange-500/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            {analysisResult ? (
              <div className="card-base !p-12 h-full bg-zinc-900/80 border-orange-500/20 animate-fade-in shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative z-10 flex flex-col">
                 <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white shadow-[0_15px_30px_rgba(249,115,22,0.3)]">
                        <Check size={32} strokeWidth={4} />
                     </div>
                     <div>
                        <h3 className="text-3xl font-logo-main text-white uppercase tracking-wider">Photo Review</h3>
                        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Recommendations for Improvement</p>
                     </div>
                   </div>
                   <button 
                      onClick={() => { setAnalysisResult(null); setAnalysisImage(null); }}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all border border-white/5"
                    >
                      <RefreshCcw size={20}/>
                    </button>
                 </div>
                 
                 <div className="flex-grow space-y-8 overflow-y-auto custom-scrollbar pr-6">
                   <div className="prose prose-invert prose-lg max-w-none">
                     <div className="text-zinc-300 text-lg leading-[1.8] whitespace-pre-wrap font-medium bg-zinc-950/60 p-10 rounded-[3rem] border border-white/5 shadow-inner italic">
                       <span className="text-orange-500 text-5xl font-logo-main float-left mr-4 mt-1">"</span>
                       {analysisResult}
                       <span className="text-orange-500 text-5xl font-logo-main inline-block ml-2 translate-y-4">"</span>
                     </div>
                   </div>
                 </div>

                 <div className="mt-12 pt-10 border-t border-white/5 flex justify-between items-center text-zinc-500">
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Professional Advice</span>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="card-base h-full border-dashed border-zinc-800 bg-zinc-950/40 flex flex-col items-center justify-center text-center p-20 relative z-10 group-hover:border-zinc-700 transition-colors">
                 <div className="w-32 h-32 bg-zinc-900 rounded-[3rem] flex items-center justify-center mb-10 ring-1 ring-white/5 shadow-inner">
                  <ScanSearch size={48} className="text-zinc-800 animate-pulse" />
                </div>
                <h4 className="text-white font-black text-3xl uppercase tracking-tight mb-6">Expert Review</h4>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                  Our tool provides tips on lighting, style, and how to make your photos look more professional.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 z-30 bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in rounded-[1.5rem]">
                <div className="relative">
                   <div className="absolute inset-0 bg-orange-500/40 blur-[80px] animate-pulse"></div>
                   <LoaderCircle className="h-28 w-28 text-orange-500 animate-spin relative" strokeWidth={3} />
                </div>
                <p className="text-white font-black uppercase tracking-[0.8em] mt-12 text-sm ml-[0.8em]">Reviewing</p>
                <p className="text-orange-500/50 text-[10px] font-black uppercase tracking-[0.4em] mt-4 animate-pulse">Analyzing your photo...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Section */}
      <div className="bg-orange-500/[0.03] border border-orange-500/10 p-10 rounded-[3rem] flex flex-col lg:flex-row items-center gap-10 group hover:bg-orange-500/[0.05] hover:border-orange-500/20 transition-all duration-700">
        <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
          <AlertCircle className="text-orange-500 group-hover:text-white" size={40} strokeWidth={2.5} />
        </div>
        <div className="space-y-4 text-center lg:text-left">
          <h4 className="text-white text-base font-black uppercase tracking-[0.4em]">Studio Guidelines</h4>
          <p className="text-zinc-500 text-xs leading-[1.8] font-bold uppercase tracking-[0.2em] max-w-5xl">
            Photos created here must represent you professionally and fit the Flavor brand. 
            All images are reviewed for quality. High-resolution results require a paid provider key.
            By using this studio, you agree to follow our talent guidelines.
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}} />
    </div>
  );
};

export default AICreativeStudio;
