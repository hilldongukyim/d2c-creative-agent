import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, MessageSquare, X, ArrowLeft, Send } from 'lucide-react';
import { useConversation } from '@11labs/react';

const PipQA = () => {
  const navigate = useNavigate();
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'pip', content: string}>>([]);
  
  const conversation = useConversation({
    onConnect: () => console.log('Connected to Pip'),
    onDisconnect: () => console.log('Disconnected from Pip'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Conversation error:', error),
  });

  const handleStartVoiceChat = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start conversation with Pip agent
      await conversation.startSession({
        agentId: "agent_9501k3rhp078f3t9wjzth9vkdspm" // You'll need to create a specific agent for Pip
      });
    } catch (error) {
      console.error('Failed to start voice chat:', error);
    }
  };

  const handleEndVoiceChat = async () => {
    await conversation.endSession();
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      setChatMessages(prev => [...prev, { type: 'user', content: textInput }]);
      // Here you would send the message to Pip's text processing endpoint
      // For now, we'll add a mock response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'pip', 
          content: "I've received your content for quality assessment. Let me review it against our Content Creation Guidelines and Brand Guidelines. I'll provide feedback shortly." 
        }]);
      }, 1000);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-lg">
            <img 
              src="/lovable-uploads/2d6113a8-70c0-4d9e-a66a-88b336591e65.png" 
              alt="Pip Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pip - Content QA Specialist</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            I help ensure your content meets our Content Creation Guidelines and Brand Guidelines. 
            I can review your work and provide guidance for creating better, brand-aligned content.
          </p>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-4xl mx-auto">
        {!isTextMode ? (
          /* Voice Mode */
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl text-gray-800">Voice Interaction Mode</CardTitle>
              <p className="text-gray-600">Click to start speaking with Pip about your content</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex justify-center items-center space-x-4">
                {conversation.status === 'connected' ? (
                  <Button
                    onClick={handleEndVoiceChat}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg"
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    End Voice Chat
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartVoiceChat}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full text-lg"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Start Voice Chat
                  </Button>
                )}
              </div>

              {conversation.status === 'connected' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-700 font-medium">
                    🎙️ Voice chat is active {conversation.isSpeaking ? '(Pip is speaking...)' : '(Ready for your input)'}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsTextMode(true)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Switch to Text Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Text Mode */
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800">Text Chat with Pip</CardTitle>
                <p className="text-gray-600">Send your content for quality assessment</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsTextMode(false)}
                className="text-gray-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Start the conversation by sharing your content for review</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Text Input */}
              <div className="flex space-x-3">
                <Textarea
                  placeholder="Paste your content here for Pip to review against guidelines..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[100px] resize-none"
                />
                <Button
                  onClick={handleSendText}
                  disabled={!textInput.trim()}
                  className="bg-purple-500 hover:bg-purple-600 text-white self-end px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PipQA;