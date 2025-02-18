import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { SettingsModal } from './components/SettingsModal';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { useMessageState } from './hooks/useMessageState';
import { useModelState } from './hooks/useModelState';
import { useInputState } from './hooks/useInputState';

import { createMessageHandlers } from './handlers/messageHandlers';
import { createSettingsHandlers } from './handlers/settingsHandlers';
import { createInputHandlers } from './handlers/inputHandlers';

import { MODEL_PROVIDERS } from './constants';
import './styles/messages.css';
import './styles/settings.css';

export const AIChat = ({
  sendToSidebar,
  createNewConversation,
  storagePath,
  currentConversation,
  conversations,
  onConversationSelect,
  onConversationDelete,
  onConversationRename,
  window,
  electron,
  openInBrowserTab
}) => {
  // 使用状态管理 hooks
  const messageState = useMessageState(currentConversation);
  const modelState = useModelState();
  const inputState = useInputState();

  // 添加新的状态
  const [maxTokens, setMaxTokens] = useState(() => {
    return parseInt(localStorage.getItem('aichat_max_tokens')) || 2000;
  });

  const [temperature, setTemperature] = useState(() => {
    return parseFloat(localStorage.getItem('aichat_temperature')) || 0.7;
  });

  // 添加网络搜索状态
  const [isNetworkEnabled, setIsNetworkEnabled] = useState(false);

  // 添加 AbortController 状态
  const [abortController, setAbortController] = useState(null);

  // 添加图片生成参数的全局状态
  const [imageSettings, setImageSettings] = useState(() => {
    const model = localStorage.getItem('aichat_image_model');
    
    // 如果没有存储的模型，使用默认值
    if (!model) {
      const defaultModel = 'black-forest-labs/FLUX.1-schnell';
      localStorage.setItem('aichat_image_model', defaultModel);
      return {
        model: defaultModel,
        image_size: '1024x576'
      };
    }
    
    console.log('初始化图片设置 - 模型:', model);
    
    let settings;
    if (model === 'black-forest-labs/FLUX.1-pro') {
      settings = {
        model,
        width: Math.floor(parseInt(localStorage.getItem('aichat_image_width')) || 1024),
        height: Math.floor(parseInt(localStorage.getItem('aichat_image_height')) || 768),
        steps: parseInt(localStorage.getItem('aichat_image_steps')) || 20,
        guidance: parseFloat(localStorage.getItem('aichat_image_guidance')) || 3,
        safety_tolerance: parseInt(localStorage.getItem('aichat_image_safety')) || 2,
        interval: parseFloat(localStorage.getItem('aichat_image_interval')) || 2,
        prompt_upsampling: localStorage.getItem('aichat_prompt_upsampling') === 'true'
      };

      // 保存默认设置到 localStorage
      if (!localStorage.getItem('aichat_image_width')) {
        localStorage.setItem('aichat_image_width', settings.width.toString());
        localStorage.setItem('aichat_image_height', settings.height.toString());
        localStorage.setItem('aichat_image_steps', settings.steps.toString());
        localStorage.setItem('aichat_image_guidance', settings.guidance.toString());
        localStorage.setItem('aichat_image_safety', settings.safety_tolerance.toString());
        localStorage.setItem('aichat_image_interval', settings.interval.toString());
        localStorage.setItem('aichat_prompt_upsampling', settings.prompt_upsampling.toString());
        console.log('保存 FLUX.1-pro 默认设置到 localStorage:', settings);
      }
    } else {
      settings = {
        model,
        image_size: localStorage.getItem('aichat_image_size') || '1024x576'
      };

      // 保存默认设置到 localStorage
      if (!localStorage.getItem('aichat_image_size')) {
        localStorage.setItem('aichat_image_size', settings.image_size);
        console.log('保存默认图片尺寸到 localStorage:', settings.image_size);
      }
    }

    console.log('最终图片设置:', settings);
    return settings;
  });

  // 添加视频生成参数的全局状态
  const [videoSettings, setVideoSettings] = useState(() => {
    return {
      model: localStorage.getItem('aichat_video_model') || 'Lightricks/LTX-Video',
      seed: parseInt(localStorage.getItem('aichat_video_seed')) || Math.floor(Math.random() * 9999999999)
    };
  });

  // 处理媒体设置更新
  const handleMediaSettingsUpdate = (settings) => {
    // 更新图片设置
    setImageSettings(settings.image);
    
    // 更新图片设置到 localStorage
    if (settings.image.model === 'black-forest-labs/FLUX.1-pro') {
      localStorage.setItem('aichat_image_model', settings.image.model);
      localStorage.setItem('aichat_image_width', settings.image.width.toString());
      localStorage.setItem('aichat_image_height', settings.image.height.toString());
      localStorage.setItem('aichat_image_steps', settings.image.steps.toString());
      localStorage.setItem('aichat_image_guidance', settings.image.guidance.toString());
      localStorage.setItem('aichat_image_safety', settings.image.safety_tolerance.toString());
      localStorage.setItem('aichat_image_interval', settings.image.interval.toString());
      localStorage.setItem('aichat_prompt_upsampling', settings.image.prompt_upsampling.toString());
    } else {
      localStorage.setItem('aichat_image_model', settings.image.model);
      localStorage.setItem('aichat_image_size', settings.image.image_size);
    }

    // 更新视频设置
    setVideoSettings(settings.video);
    
    // 更新视频设置到 localStorage
    localStorage.setItem('aichat_video_model', settings.video.model);
    localStorage.setItem('aichat_video_seed', settings.video.seed.toString());
  };

  // 创建输入处理函数的引用
  const [inputHandlers, setInputHandlers] = useState(null);
  const [messageHandlers, setMessageHandlers] = useState(null);

  // 使用 useCallback 创建稳定的处理函数
  const createHandlers = useCallback(() => {
    const handlers = createInputHandlers({
      messageInput: inputState.messageInput,
      setMessageInput: inputState.setMessageInput,
      setIsGenerating: inputState.setIsGenerating,
      selectedFile: inputState.selectedFile,
      setSelectedFile: inputState.setSelectedFile,
      addToHistory: inputState.addToHistory,
      handleHistoryNavigation: inputState.handleHistoryNavigation,
      addMessage: messageState.addMessage,
      currentConversation,
      messages: messageState.messages,
      setMessages: messageState.setMessages,
      selectedProvider: modelState.selectedProvider,
      selectedModel: modelState.selectedModel,
      apiKey: modelState.apiKey,
      apiHost: modelState.apiHost,
      setMessageStates: messageState.setMessageStates,
      setAnimationStates: messageState.setAnimationStates,
      setFailedMessages: messageState.setFailedMessages,
      setRetryingMessageId: messageState.setRetryingMessageId,
      maxTokens,
      temperature,
      setError: modelState.setError,
      abortController,
      setAbortController,
      isNetworkEnabled,
      updateMessage: messageState.updateMessage,
      deleteMessage: messageState.deleteMessage,
      imageSettings,
      videoSettings  // 添加视频设置参数
    });

    const msgHandlers = createMessageHandlers({
      messages: messageState.messages,
      setMessages: messageState.setMessages,
      setEditingMessageId: messageState.setEditingMessageId,
      setEditContent: messageState.setEditContent,
      setRetryingMessageId: messageState.setRetryingMessageId,
      setFailedMessages: messageState.setFailedMessages,
      selectedModel: modelState.selectedModel,
      selectedProvider: modelState.selectedProvider,
      apiKey: modelState.apiKey,
      apiHost: modelState.apiHost,
      setMessageStates: messageState.setMessageStates,
      currentConversation,
      window,
      maxTokens,
      temperature,
      editContent: messageState.editContent,  // current edit content
      abortController,
      setAbortController,
      isNetworkEnabled,
      handleSendMessage: handlers.handleSendMessage
    });

    return { inputHandlers: handlers, messageHandlers: msgHandlers };
  }, [
    currentConversation?.id,
    currentConversation?.path,
    modelState.selectedModel,
    modelState.selectedProvider,
    modelState.apiKey,
    modelState.apiHost,
    maxTokens,
    temperature,
    isNetworkEnabled,
    abortController,
    messageState.setMessages,
    messageState.setMessageStates,
    messageState.setAnimationStates,
    messageState.setEditingMessageId,
    messageState.setEditContent,
    messageState.addMessage,
    messageState.messages,
    inputState.messageInput,
    inputState.setMessageInput,
    window,
    imageSettings,
    videoSettings,
    messageState.editContent
  ]);

  // 初始化处理函数
  useEffect(() => {
    const { inputHandlers: newInputHandlers, messageHandlers: newMessageHandlers } = createHandlers();
    setInputHandlers(newInputHandlers);
    setMessageHandlers(newMessageHandlers);
  }, [createHandlers]);

  // 创建设置处理函数
  const settingsHandlers = createSettingsHandlers({
    setSelectedProvider: modelState.setSelectedProvider,
    setSelectedModel: modelState.setSelectedModel,
    setApiHost: modelState.setApiHost,
    setShowSettings: modelState.setShowSettings
  });

  // 添加创建新对话的函数
  const handleCreateNewConversation = async () => {
    try {
      // 直接调用父组件传入的创建函数
      await createNewConversation();
    } catch (error) {
      console.error('创建新对话失败:', error);
      alert('创建新对话失败: ' + error.message);
    }
  };

  // 添加滚动到底部的函数
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('#ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  // 监听消息变化和对话切换，自动滚动到底部
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messageState.messages, currentConversation]);

  // 在组件挂载时将创建新对话的函数绑定到 window.aichat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.aichat = window.aichat || {};
      window.aichat.createNewConversation = handleCreateNewConversation;
      window.aichat.setShowSettings = modelState.setShowSettings;
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.aichat) {
        delete window.aichat.createNewConversation;
        delete window.aichat.setShowSettings;
      }
    };
  }, [createNewConversation, modelState.setShowSettings]);

  // 添加 openFileLocation 函数
  const openFileLocation = async (file) => {
    try {
      await electron.openFileLocation(file.path);
    } catch (error) {
      console.error('Failed to open file location:', error);
      alert('打开文件位置失败');
    }
  };

  // 更新 Lightbox 组件配置
  const [openLightbox, setOpenLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [images, setImages] = useState([]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 只在 handlers 都准备好后渲染内容 */}
      {inputHandlers && messageHandlers ? (
        <>
          {/* 顶部标题栏 */}
          <div className="flex-none">
            <Header
              selectedModel={modelState.selectedModel}
              setSelectedModel={modelState.setSelectedModel}
              availableModels={modelState.availableModels}
              currentConversation={currentConversation}
              setShowSettings={modelState.setShowSettings}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              temperature={temperature}
              setTemperature={setTemperature}
            />
          </div>

          {/* 消息列表区域 */}
          <div className="flex-1 overflow-auto">
            <MessageList
              messages={messageState.messages}
              selectedModel={modelState.selectedModel}
              editingMessageId={messageState.editingMessageId}
              editContent={messageState.editContent}
              setEditContent={messageState.setEditContent}
              handleEditStart={messageHandlers.startEditing}
              handleEditCancel={messageHandlers.cancelEditing}
              handleEditSave={messageHandlers.saveEdit}
              handleDeleteMessage={messageHandlers.deleteMessage}
              handleRetry={messageHandlers.handleRetry}
              handleStop={messageHandlers.handleStop}
              handleHistoryNavigation={messageHandlers.handleHistoryNavigation}
              openFileLocation={openFileLocation}
              openInBrowserTab={openInBrowserTab}
            />
          </div>

          {/* 底部输入区域 */}
          <div className="flex-none">
            <InputArea
              messageInput={inputState.messageInput}
              setMessageInput={inputState.setMessageInput}
              handleSendMessage={inputHandlers.handleSendMessage}
              handleKeyDown={inputHandlers.handleKeyDown}
              fileInputRef={inputState.fileInputRef}
              isNetworkEnabled={isNetworkEnabled}
              setIsNetworkEnabled={setIsNetworkEnabled}
            />
          </div>

          {/* 设置弹窗 */}
          {modelState.showSettings && (
            <SettingsModal
              selectedProvider={modelState.selectedProvider}
              setSelectedProvider={modelState.setSelectedProvider}
              selectedModel={modelState.selectedModel}
              handleModelChange={settingsHandlers.handleModelChange}
              availableModels={modelState.availableModels}
              apiHost={modelState.apiHost}
              handleApiHostChange={settingsHandlers.handleApiHostChange}
              apiKey={modelState.apiKey}
              setApiKey={modelState.setApiKey}
              showApiKey={modelState.showApiKey}
              setShowApiKey={modelState.setShowApiKey}
              handleSettingsClose={settingsHandlers.handleSettingsClose}
              MODEL_PROVIDERS={MODEL_PROVIDERS}
              onImageSettingsUpdate={handleMediaSettingsUpdate}  // 修改回调函数名
            />
          )}

          {/* Lightbox 组件 */}
          <Lightbox
            open={openLightbox}
            close={() => setOpenLightbox(false)}
            index={lightboxIndex}
            slides={images}
            plugins={[Zoom, Thumbnails, Captions]}
            animation={{ fade: 300 }}
            carousel={{ finite: images.length <= 1 }}
            zoom={{
              maxZoomPixelRatio: 5,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true
            }}
            captions={{
              showToggle: true,
              descriptionTextAlign: 'center',
              descriptionMaxLines: 3,
            }}
          />
        </>
      ) : (
        // 加载状态
        <div className="flex-1 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  );
}; 