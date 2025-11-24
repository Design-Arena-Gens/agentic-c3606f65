'use client';

import { useState, useRef, useEffect } from 'react';

interface PosterStyle {
  id: string;
  name: string;
  colors: string[];
  gradient: string;
  textColor: string;
}

const posterStyles: PosterStyle[] = [
  {
    id: 'modern',
    name: 'Modern Gradient',
    colors: ['#667eea', '#764ba2'],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'vibrant',
    name: 'Vibrant Sunset',
    colors: ['#f093fb', '#f5576c'],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: ['#4facfe', '#00f2fe'],
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'elegant',
    name: 'Elegant Dark',
    colors: ['#434343', '#000000'],
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'fresh',
    name: 'Fresh Green',
    colors: ['#56ab2f', '#a8e063'],
    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'warm',
    name: 'Warm Autumn',
    colors: ['#ff6b6b', '#feca57'],
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    textColor: '#ffffff'
  }
];

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<PosterStyle>(posterStyles[0]);
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [cta, setCta] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        generateAISuggestions(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAISuggestions = async (file: File) => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data);
        setHeadline(data.headline);
        setSubheadline(data.subheadline);
        setCta(data.cta);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setHeadline('Amazing Product!');
      setSubheadline('Get yours today and experience the difference');
      setCta('Shop Now');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      drawPoster();
    }
  }, [uploadedImage, selectedStyle, headline, subheadline, cta]);

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, selectedStyle.colors[0]);
    gradient.addColorStop(1, selectedStyle.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw product image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imgWidth = 700;
      const imgHeight = (img.height / img.width) * imgWidth;
      const imgX = (canvas.width - imgWidth) / 2;
      const imgY = 150;

      // Add shadow to image
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw headline
      ctx.fillStyle = selectedStyle.textColor;
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(headline, canvas.width / 2, 100);

      // Draw subheadline
      ctx.font = '36px Arial';
      const subY = imgY + imgHeight + 80;
      wrapText(ctx, subheadline, canvas.width / 2, subY, 900, 45);

      // Draw CTA button
      const buttonY = subY + 100;
      const buttonWidth = 300;
      const buttonHeight = 70;
      const buttonX = (canvas.width - buttonWidth) / 2;

      ctx.fillStyle = selectedStyle.textColor;
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

      ctx.fillStyle = selectedStyle.colors[0];
      ctx.font = 'bold 32px Arial';
      ctx.fillText(cta, canvas.width / 2, buttonY + 48);
    };
    img.src = uploadedImage;
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'ad-poster.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Ad Poster Maker
          </h1>
          <p className="text-xl text-gray-600">
            Upload your product image and let AI create stunning ad posters
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. Upload Product Image
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                {uploadedImage ? 'Change Image' : 'Upload Image'}
              </button>
              {isGenerating && (
                <div className="mt-4 text-center text-purple-600 font-semibold">
                  AI is analyzing your product...
                </div>
              )}
            </div>

            {uploadedImage && (
              <>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    2. Choose Style
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {posterStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-4 rounded-xl transition-all ${
                          selectedStyle.id === style.id
                            ? 'ring-4 ring-purple-600 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                        style={{ background: style.gradient }}
                      >
                        <div className="text-white font-semibold text-center">
                          {style.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    3. Customize Copy
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-gray-900"
                        placeholder="Enter headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subheadline
                      </label>
                      <textarea
                        value={subheadline}
                        onChange={(e) => setSubheadline(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-gray-900"
                        placeholder="Enter subheadline"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Call to Action
                      </label>
                      <input
                        type="text"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-gray-900"
                        placeholder="Enter CTA"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Preview
              </h2>
              {uploadedImage ? (
                <div className="space-y-6">
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-xl shadow-lg"
                  />
                  <button
                    onClick={downloadPoster}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Download Poster
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg
                      className="mx-auto h-24 w-24 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg font-semibold">Upload an image to start</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
