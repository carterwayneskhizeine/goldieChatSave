import React, { useEffect, useState } from 'react';
import '../styles/settings.css';

export const SettingsModal = ({
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  handleModelChange,
  availableModels,
  apiHost,
  handleApiHostChange,
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
  handleSettingsClose,
  MODEL_PROVIDERS,
  onImageSettingsUpdate
}) => {
  // 确保 selectedProvider 是有效的
  const currentProvider = MODEL_PROVIDERS[selectedProvider] || MODEL_PROVIDERS.openai;

  // 添加 tabs 状态
  const [activeTab, setActiveTab] = useState('model');
  
  // 添加 Google Search 相关状态
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    return localStorage.getItem('aichat_google_api_key') || '';
  });
  const [searchEngineId, setSearchEngineId] = useState(() => {
    return localStorage.getItem('aichat_search_engine_id') || '';
  });
  const [showGoogleApiKey, setShowGoogleApiKey] = useState(false);
  
  // 添加最大搜索数量状态
  const [maxSearchResults, setMaxSearchResults] = useState(() => {
    return parseInt(localStorage.getItem('aichat_max_search_results')) || 5;
  });

  // 添加消息历史记录数量状态
  const [maxHistoryMessages, setMaxHistoryMessages] = useState(() => {
    const saved = localStorage.getItem('aichat_max_history_messages');
    return saved ? parseInt(saved) : 5;  // 默认5条
  });

  // 添加生图模型状态
  const [imageModel, setImageModel] = useState(() => {
    return localStorage.getItem('aichat_image_model') || 'black-forest-labs/FLUX.1-schnell';
  });

  // 添加视频模型状态
  const [videoModel, setVideoModel] = useState(() => {
    return localStorage.getItem('aichat_video_model') || 'Lightricks/LTX-Video';
  });

  // 添加视频随机种子状态
  const [videoSeed, setVideoSeed] = useState(() => 
    parseInt(localStorage.getItem('aichat_video_seed')) || Math.floor(Math.random() * 9999999999)
  );

  // 添加图片分辨率状态
  const [imageSize, setImageSize] = useState(() => {
    return localStorage.getItem('aichat_image_size') || '1024x576';
  });

  // 添加 FLUX.1-pro 模型的参数状态
  const [imageWidth, setImageWidth] = useState(() => 
    parseInt(localStorage.getItem('aichat_image_width')) || 1024
  );
  const [imageHeight, setImageHeight] = useState(() => 
    parseInt(localStorage.getItem('aichat_image_height')) || 768
  );
  const [imageSteps, setImageSteps] = useState(() => 
    parseInt(localStorage.getItem('aichat_image_steps')) || 20
  );
  const [imageGuidance, setImageGuidance] = useState(() => 
    parseFloat(localStorage.getItem('aichat_image_guidance')) || 3
  );
  const [imageSafety, setImageSafety] = useState(() => 
    parseInt(localStorage.getItem('aichat_image_safety')) || 2
  );
  const [imageInterval, setImageInterval] = useState(() => 
    parseFloat(localStorage.getItem('aichat_image_interval')) || 2
  );
  const [promptUpsampling, setPromptUpsampling] = useState(() => 
    localStorage.getItem('aichat_prompt_upsampling') === 'true'
  );

  // 添加 FLUX.1-dev 模型的参数状态
  const [devImageSteps, setDevImageSteps] = useState(() => 
    parseInt(localStorage.getItem('aichat_dev_image_steps')) || 20
  );
  const [devPromptEnhancement, setDevPromptEnhancement] = useState(() => 
    localStorage.getItem('aichat_dev_prompt_enhancement') === 'true'
  );

  // 添加其他模型的提示增强状态
  const [sdPromptEnhancement, setSdPromptEnhancement] = useState(() => 
    localStorage.getItem('aichat_sd_prompt_enhancement') === 'true'
  );
  const [schnellPromptEnhancement, setSchnellPromptEnhancement] = useState(() => 
    localStorage.getItem('aichat_schnell_prompt_enhancement') === 'true'
  );

  // 生图模型列表
  const IMAGE_MODELS = [
    'black-forest-labs/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-dev',
    'black-forest-labs/FLUX.1-pro',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'stabilityai/stable-diffusion-3-5-large',
    'stabilityai/stable-diffusion-3-5-large-turbo',
    'deepseek-ai/Janus-Pro-7B',
    'stabilityai/stable-diffusion-3-medium',
    'stabilityai/stable-diffusion-2-1',
    'Pro/black-forest-labs/FLUX.1-schnell',
    'LoRA/black-forest-labs/FLUX.1-dev'
  ];

  // 视频模型列表
  const VIDEO_MODELS = [
    'Lightricks/LTX-Video',
    'tencent/HunyuanVideo',
    'genmo/mochi-1-preview'
  ];

  // 图片分辨率列表
  const IMAGE_SIZES = [
    // 16:9 分辨率选项
    { value: '1024x576', label: '1024×576 (16:9 横版)' },
    { value: '1280x720', label: '1280×720 (16:9 横版)' },
    // FLUX.1-dev 官方支持的分辨率
    { value: '1024x1024', label: '1024×1024 (1:1 方形)' },
    { value: '960x1280', label: '960×1280 (3:4 竖版)' },
    { value: '768x1024', label: '768×1024 (3:4 竖版)' },
    { value: '720x1440', label: '720×1440 (1:2 竖版)' },
    { value: '720x1280', label: '720×1280 (9:16 竖版)' }
  ];

  // 处理 Google API 密钥变更
  const handleGoogleApiKeyChange = (value) => {
    setGoogleApiKey(value);
    localStorage.setItem('aichat_google_api_key', value);
  };

  // 处理搜索引擎 ID 变更
  const handleSearchEngineIdChange = (value) => {
    setSearchEngineId(value);
    localStorage.setItem('aichat_search_engine_id', value);
  };

  // 处理 Google API 密钥粘贴
  const handleGoogleApiKeyPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleGoogleApiKeyChange(text);
    } catch (error) {
      console.error('粘贴失败:', error);
    }
  };

  // 处理 API 密钥变更
  const handleApiKeyChange = (value) => {
    setApiKey(value);
  };

  // 处理粘贴
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApiKey(text);
    } catch (error) {
      console.error('粘贴失败:', error);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      e.preventDefault();
      handlePaste();
    }
  };

  // 处理最大搜索数量变更
  const handleMaxSearchResultsChange = (value) => {
    const numValue = parseInt(value);
    setMaxSearchResults(numValue);
    localStorage.setItem('aichat_max_search_results', numValue.toString());
  };

  // 处理消息历史记录数量变更
  const handleMaxHistoryMessagesChange = (value) => {
    const numValue = parseInt(value);
    setMaxHistoryMessages(numValue);
    localStorage.setItem('aichat_max_history_messages', numValue.toString());
  };

  // 处理生图模型变更
  const handleImageModelChange = (value) => {
    setImageModel(value);
    localStorage.setItem('aichat_image_model', value);
  };

  // 处理图片分辨率变更
  const handleImageSizeChange = (value) => {
    setImageSize(value);
    localStorage.setItem('aichat_image_size', value);
  };

  const openExternalLink = (url) => {
    try {
      // 首选使用 electron 的 shell.openExternal
      if (window.electron?.shell?.openExternal) {
        window.electron.shell.openExternal(url);
      }
      // 回退到 window.open
      else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      // 最后的回退方案
      window.open(url, '_blank');
    }
  };

  // 修改 collectMediaSettings 函数
  const collectMediaSettings = () => {
    const imageSettings = {
      model: imageModel,
      ...(imageModel === 'black-forest-labs/FLUX.1-pro' ? {
        width: 1024,
        height: 768,
        steps: imageSteps,
        guidance: imageGuidance,
        safety_tolerance: imageSafety,
        interval: imageInterval,
        prompt_upsampling: promptUpsampling
      } : imageModel === 'black-forest-labs/FLUX.1-dev' ? {
        image_size: imageSize,
        num_inference_steps: devImageSteps,
        prompt_enhancement: devPromptEnhancement
      } : imageModel.includes('stable-diffusion-3') ? {
        image_size: imageSize,
        prompt_enhancement: sdPromptEnhancement
      } : imageModel.includes('FLUX.1-schnell') ? {
        image_size: imageSize,
        prompt_enhancement: schnellPromptEnhancement
      } : {
        image_size: imageSize
      })
    };

    const videoSettings = {
      model: videoModel,
      seed: videoSeed
    };
    
    return {
      image: imageSettings,
      video: videoSettings
    };
  };

  // 修改关闭处理函数
  const handleClose = () => {
    // 收集并更新媒体设置
    const mediaSettings = collectMediaSettings();
    onImageSettingsUpdate?.(mediaSettings);
    
    // 调用原有的关闭处理函数
    handleSettingsClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto settings-panel">
        {/* 标题和关闭按钮 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">设置</h1>
          <button 
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          {/* 标签页 */}
          <div className="tabs tabs-bordered w-full">
            <a 
              className={`tab ${activeTab === 'model' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('model')}
            >
              模型
            </a>
            <a 
              className={`tab ${activeTab === 'search' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              搜索
            </a>
            {selectedProvider === 'siliconflow' && (
              <>
                <a 
                  className={`tab ${activeTab === 'image' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('image')}
                >
                  图片
                </a>
                <a 
                  className={`tab ${activeTab === 'video' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('video')}
                >
                  视频
                </a>
              </>
            )}
            <a 
              className={`tab ${activeTab === 'other' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('other')}
            >
              其它
            </a>
          </div>
          
          {/* Tab 1: 模型设置 */}
          <div className={activeTab === 'model' ? '' : 'hidden'}>
            {/* 模型提供方 */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">模型提供方</h3>
              <select 
                className="select select-bordered w-full"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {Object.entries(MODEL_PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>{provider.name}</option>
                ))}
              </select>
            </div>

            {/* 具体模型选择 */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">模型</h3>
              <select 
                className="select select-bordered w-full"
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
              >
                {availableModels
                  .filter(model => !IMAGE_MODELS.includes(model))
                  .map(model => (
                  <option key={model} value={model}>{model}</option>
                  ))
                }
              </select>
            </div>

            {/* API 设置 */}
            <div className="space-y-4">
              {/* API Host */}
              <div>
                <h3 className="text-lg font-medium mb-2">API 地址</h3>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={apiHost}
                  onChange={(e) => handleApiHostChange(e.target.value)}
                  placeholder="请输入 API 地址..."
                />
              </div>

              {/* API Key */}
              <div>
                <h3 className="text-lg font-medium mb-2">API 密钥</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex w-full gap-0">
                    <input
                      type={showApiKey ? "text" : "password"}
                      className="input input-bordered flex-1 rounded-r-none"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder={`请输入 ${currentProvider.name} API 密钥...`}
                      onKeyDown={handleKeyDown}
                    />
                    <button 
                      type="button"
                      className="btn rounded-l-none"
                      onClick={handlePaste}
                      title="点击粘贴"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                    <button 
                      type="button"
                      className="btn btn-ghost rounded-none border-l-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                      title={showApiKey ? "隐藏密钥" : "显示密钥"}
                    >
                      {showApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 text-xs opacity-70">
                    <div className="settings-help-text">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        API 密钥已为每个提供商单独保存，切换提供商时会自动加载对应的密钥
                      </span>
                    </div>
                    {currentProvider.needsApiKey && (
                      <div className="settings-help-text text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                          此提供商需要 API 密钥才能使用
                        </span>
                      </div>
                    )}
                    {currentProvider.apiKeyHelp && (
                      <div className="settings-help-text mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {currentProvider.apiKeyHelp.split(': ').map((part, index, array) => {
                            if (index === array.length - 1) {
                              return (
                                <a
                                  key={index}
                                  className="text-primary hover:text-primary-focus cursor-pointer"
                                  onClick={() => openExternalLink(part.trim())}
                                >
                                  {part.trim()}
                                </a>
                              );
                            }
                            return part + ': ';
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 2: 搜索设置 */}
          <div className={activeTab === 'search' ? '' : 'hidden'}>
            <div className="space-y-4">
              {/* Google Search API Key */}
              <div>
                <h3 className="text-lg font-medium mb-2">Google Custom Search JSON API</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex w-full gap-0">
                    <input
                      type={showGoogleApiKey ? "text" : "password"}
                      className="input input-bordered flex-1 rounded-r-none"
                      value={googleApiKey}
                      onChange={(e) => handleGoogleApiKeyChange(e.target.value)}
                      placeholder="Google Custom Search JSON API..."
                    />
                    <button 
                      type="button"
                      className="btn rounded-l-none"
                      onClick={handleGoogleApiKeyPaste}
                      title="点击粘贴"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                    <button 
                      type="button"
                      className="btn btn-ghost rounded-none border-l-0"
                      onClick={() => setShowGoogleApiKey(!showGoogleApiKey)}
                      title={showGoogleApiKey ? "隐藏密钥" : "显示密钥"}
                    >
                      {showGoogleApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Engine ID */}
              <div>
                <h3 className="text-lg font-medium mb-2">搜索引擎 ID</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex w-full gap-0">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      value={searchEngineId}
                      onChange={(e) => handleSearchEngineIdChange(e.target.value)}
                      placeholder="请输入搜索引擎 ID..."
                    />
                  </div>
                </div>
              </div>

              {/* 最大搜索数量滑块 */}
              <div>
                <h3 className="text-lg font-medium mb-2">最大搜索结果数量</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={maxSearchResults}
                      onChange={(e) => handleMaxSearchResultsChange(e.target.value)}
                      className="range range-primary"
                      step="1"
                    />
                    <span className="text-lg font-medium min-w-[3ch]">{maxSearchResults}</span>
                  </div>
                  <div className="text-xs opacity-70">
                    设置每次搜索返回的最大结果数量（1-10），免费用户每次搜索最多返回10条结果
                  </div>
                </div>
              </div>

              {/* 帮助信息 */}
              <div className="text-xs opacity-70 space-y-2">
                <div className="settings-help-text">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    每天免费提供100次搜索查询，超出部分按每1000次查询收费$5
                  </span>
                </div>
                <div className="settings-help-text">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    获取帮助：
                    <a
                      className="text-primary hover:text-primary-focus cursor-pointer"
                      onClick={() => openExternalLink('https://developers.google.com/custom-search/v1/overview')}
                    >
                      Google Custom Search JSON API
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 3: 图片设置 */}
          {selectedProvider === 'siliconflow' && (
            <div className={activeTab === 'image' ? '' : 'hidden'}>
              <div className="space-y-4">
                {/* 生图模型选择 */}
                <div>
                  <h3 className="text-lg font-medium mb-2">生图模型</h3>
                  <select 
                    className="select select-bordered w-full"
                    value={imageModel}
                    onChange={(e) => handleImageModelChange(e.target.value)}
                  >
                    {IMAGE_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <div className="text-xs opacity-70 mt-2">
                    选择用于图片生成的模型，使用 /image 命令时会使用此模型
                    {imageModel === 'black-forest-labs/FLUX.1-pro' && (
                      <div className="mt-1 text-info">
                        使用固定分辨率：1024×768
                      </div>
                    )}
                  </div>
                </div>

                {/* 根据不同的模型显示不同的设置选项 */}
                {imageModel === 'black-forest-labs/FLUX.1-pro' ? (
                  <>
                    {/* 步数设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">步数 (Steps)</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="2"
                          max="50"
                          step="1"
                          value={imageSteps}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setImageSteps(value);
                            localStorage.setItem('aichat_image_steps', value.toString());
                          }}
                          className="range range-primary flex-1"
                        />
                        <span className="text-lg font-medium min-w-[3ch]">{imageSteps}</span>
                      </div>
                      <div className="text-xs opacity-70">生成步数范围：2-50</div>
                    </div>

                    {/* 引导系数设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">引导系数 (Guidance)</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1.5"
                          max="5"
                          step="0.1"
                          value={imageGuidance}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setImageGuidance(value);
                            localStorage.setItem('aichat_image_guidance', value.toString());
                          }}
                          className="range range-primary flex-1"
                        />
                        <span className="text-lg font-medium min-w-[3ch]">{imageGuidance}</span>
                      </div>
                      <div className="text-xs opacity-70">值越高越严格遵循提示词，值越低创造性越强</div>
                    </div>

                    {/* 安全容忍度设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">安全容忍度 (Safety Tolerance)</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="6"
                          step="1"
                          value={imageSafety}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setImageSafety(value);
                            localStorage.setItem('aichat_image_safety', value.toString());
                          }}
                          className="range range-primary flex-1"
                        />
                        <span className="text-lg font-medium min-w-[3ch]">{imageSafety}</span>
                      </div>
                      <div className="text-xs opacity-70">0 最严格，6 最宽松</div>
                    </div>

                    {/* 间隔参数设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">间隔参数 (Interval)</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="4"
                          step="0.1"
                          value={imageInterval}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setImageInterval(value);
                            localStorage.setItem('aichat_image_interval', value.toString());
                          }}
                          className="range range-primary flex-1"
                        />
                        <span className="text-lg font-medium min-w-[3ch]">{imageInterval}</span>
                      </div>
                      <div className="text-xs opacity-70">引导控制的间隔参数，范围：1-4</div>
                    </div>

                    {/* 提示词上采样开关 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">提示词上采样</h3>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">启用提示词上采样</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={promptUpsampling}
                            onChange={(e) => {
                              setPromptUpsampling(e.target.checked);
                              localStorage.setItem('aichat_prompt_upsampling', e.target.checked.toString());
                            }}
                          />
                        </label>
                      </div>
                      <div className="text-xs opacity-70">启用后将自动调整提示词以生成更具创意的内容</div>
                    </div>
                  </>
                ) : imageModel === 'black-forest-labs/FLUX.1-dev' ? (
                  <>
                    {/* 默认分辨率设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">默认分辨率</h3>
                      <select 
                        className="select select-bordered w-full"
                        value={imageSize}
                        onChange={(e) => handleImageSizeChange(e.target.value)}
                      >
                        {IMAGE_SIZES.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                      <div className="text-xs opacity-70 mt-2">
                        选择图片生成的默认分辨率，也可以使用 /image 命令时通过 --size 参数指定其他分辨率
                      </div>
                    </div>

                    {/* 推理步骤数设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">推理步骤数 (Steps)</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="2"
                          max="29"
                          step="1"
                          value={devImageSteps}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setDevImageSteps(value);
                            localStorage.setItem('aichat_dev_image_steps', value.toString());
                          }}
                          className="range range-primary flex-1"
                        />
                        <span className="text-lg font-medium min-w-[3ch]">{devImageSteps}</span>
                      </div>
                      <div className="text-xs opacity-70">推理步骤数范围：2-29</div>
                    </div>

                    {/* 提示增强开关 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">提示增强</h3>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">启用提示增强</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={devPromptEnhancement}
                            onChange={(e) => {
                              setDevPromptEnhancement(e.target.checked);
                              localStorage.setItem('aichat_dev_prompt_enhancement', e.target.checked.toString());
                            }}
                          />
                        </label>
                      </div>
                      <div className="text-xs opacity-70">启用后将自动优化提示词以生成更好的结果</div>
                    </div>
                  </>
                ) : imageModel.includes('stable-diffusion-3') ? (
                  <>
                    {/* 默认分辨率设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">默认分辨率</h3>
                      <select 
                        className="select select-bordered w-full"
                        value={imageSize}
                        onChange={(e) => handleImageSizeChange(e.target.value)}
                      >
                        {IMAGE_SIZES.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                      <div className="text-xs opacity-70 mt-2">
                        选择图片生成的默认分辨率，也可以使用 /image 命令时通过 --size 参数指定其他分辨率
                      </div>
                    </div>

                    {/* 提示增强开关 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">提示增强</h3>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">启用提示增强</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={sdPromptEnhancement}
                            onChange={(e) => {
                              setSdPromptEnhancement(e.target.checked);
                              localStorage.setItem('aichat_sd_prompt_enhancement', e.target.checked.toString());
                            }}
                          />
                        </label>
                      </div>
                      <div className="text-xs opacity-70">启用后将自动优化提示词以生成更好的结果</div>
                    </div>
                  </>
                ) : imageModel.includes('FLUX.1-schnell') ? (
                  <>
                    {/* 默认分辨率设置 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">默认分辨率</h3>
                      <select 
                        className="select select-bordered w-full"
                        value={imageSize}
                        onChange={(e) => handleImageSizeChange(e.target.value)}
                      >
                        {IMAGE_SIZES.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                      <div className="text-xs opacity-70 mt-2">
                        选择图片生成的默认分辨率，也可以使用 /image 命令时通过 --size 参数指定其他分辨率
                      </div>
                    </div>

                    {/* 提示增强开关 */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">提示增强</h3>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">启用提示增强</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={schnellPromptEnhancement}
                            onChange={(e) => {
                              setSchnellPromptEnhancement(e.target.checked);
                              localStorage.setItem('aichat_schnell_prompt_enhancement', e.target.checked.toString());
                            }}
                          />
                        </label>
                      </div>
                      <div className="text-xs opacity-70">启用后将自动优化提示词以生成更好的结果</div>
                    </div>
                  </>
                ) : (
                  // 其他模型的默认分辨率设置
                  <div>
                    <h3 className="text-lg font-medium mb-2">默认分辨率</h3>
                    <select 
                      className="select select-bordered w-full"
                      value={imageSize}
                      onChange={(e) => handleImageSizeChange(e.target.value)}
                    >
                      {IMAGE_SIZES.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                    <div className="text-xs opacity-70 mt-2">
                      选择图片生成的默认分辨率，也可以使用 /image 命令时通过 --size 参数指定其他分辨率
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: 视频设置 */}
          {selectedProvider === 'siliconflow' && (
            <div className={activeTab === 'video' ? '' : 'hidden'}>
              <div className="space-y-4">
                {/* 视频模型选择 */}
                <div>
                  <h3 className="text-lg font-medium mb-2">视频生成模型</h3>
                  <select 
                    className="select select-bordered w-full"
                    value={videoModel}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVideoModel(value);
                      localStorage.setItem('aichat_video_model', value);
                    }}
                  >
                    {VIDEO_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <div className="text-xs opacity-70 mt-2">
                    选择用于视频生成的模型，使用 /video 命令时会使用此模型
                  </div>
                </div>

                {/* 随机种子设置 */}
                <div>
                  <h3 className="text-lg font-medium mb-2">随机种子 (Seed)</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max="9999999999"
                      value={videoSeed}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 0 && value <= 9999999999) {
                          setVideoSeed(value);
                          localStorage.setItem('aichat_video_seed', value.toString());
                        }
                      }}
                      className="input input-bordered w-full"
                    />
                    <button
                      className="btn btn-square"
                      onClick={() => {
                        const newSeed = Math.floor(Math.random() * 9999999999);
                        setVideoSeed(newSeed);
                        localStorage.setItem('aichat_video_seed', newSeed.toString());
                      }}
                      title="生成新的随机种子"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs opacity-70">设置随机种子以获得可重复的结果（0-9999999999），留空则随机生成</div>
                </div>

                {/* 帮助信息 */}
                <div className="text-xs opacity-70 space-y-2">
                  <div className="settings-help-text">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      生成的视频链接有效期为1小时，请及时下载保存
                    </span>
                  </div>
                  <div className="settings-help-text">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      使用 /video 命令生成视频，可选参数：--model 指定模型，--image 添加参考图片
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: 其他设置 */}
          <div className={activeTab === 'other' ? '' : 'hidden'}>
            <div className="space-y-4">
              {/* 消息历史记录数量设置 */}
              <div>
                <h3 className="text-lg font-medium mb-2">消息历史记录数量</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="21"
                      value={maxHistoryMessages}
                      onChange={(e) => handleMaxHistoryMessagesChange(e.target.value)}
                      className="range range-primary"
                      step="1"
                    />
                    <span className="text-lg font-medium min-w-[5ch]">
                      {maxHistoryMessages === 21 ? '全部' : maxHistoryMessages}
                    </span>
                  </div>
                  <div className="text-xs opacity-70">
                    设置每次重试时使用的历史消息数量（5-20条，或全部历史消息）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 