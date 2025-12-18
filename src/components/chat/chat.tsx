
'use client';
import {chitChat} from '@/ai/flows/chat-flow';
import { textToSpeech as geminiTts } from '@/ai/flows/tts-flow';
import { textToSpeech as elevenLabsTts } from '@/ai/flows/elevenlabs-flow';
import { speechToText } from '@/ai/flows/stt-flow';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {cn} from '@/lib/utils';
import {MessageData} from 'genkit';
import {Bot, Send, User, X, MessageCircle, Mic, MicOff} from 'lucide-react';
import {useEffect, useRef, useState, useCallback} from 'react';
import { useUser } from '@/hooks/use-user';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


export function Chat() {
  const { profile } = useUser();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<'gemini' | 'elevenlabs'>('gemini');
  
  // States for new voice interaction mode
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const canUseElevenLabs = profile?.teams.some(t => t.role === 'ADMIN' && t.elevenlabs_api_key);

  // --- Persistence for Voice Settings ---
  useEffect(() => {
    const savedProvider = localStorage.getItem('voiceProvider');
    if (savedProvider && (savedProvider === 'gemini' || (savedProvider === 'elevenlabs' && canUseElevenLabs))) {
      setVoiceProvider(savedProvider as 'gemini' | 'elevenlabs');
    }
  }, [canUseElevenLabs]);

  const handleVoiceProviderChange = (value: 'gemini' | 'elevenlabs') => {
    setVoiceProvider(value);
    localStorage.setItem('voiceProvider', value);
  };


  // --- Core Logic ---
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, []);

  const processAndSendMessage = async (prompt: string) => {
      if (!isMounted.current) return;
      const userMessage: MessageData = {
        role: 'user',
        content: [{text: prompt}],
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setIsSpeaking(false);

      try {
        const responseMessage = await chitChat({
          history: [...messages, userMessage],
          prompt: prompt,
        });

        if (!isMounted.current) return;

        if (responseMessage) {
            setMessages((prev) => [...prev, responseMessage]);
            const responseText = responseMessage.content[0].text;
            if (isVoiceOutputEnabled && responseText) {
                setIsSpeaking(true);
                const activeTeam = profile?.teams.find(t => t.role === 'ADMIN');
                let audioResponse;
                if (voiceProvider === 'elevenlabs' && canUseElevenLabs && activeTeam) {
                    audioResponse = await elevenLabsTts({ text: responseText, teamId: activeTeam.id });
                } else {
                    audioResponse = await geminiTts({ text: responseText });
                }

                if (!isMounted.current) return;
                
                if (audioRef.current) {
                    audioRef.current.src = audioResponse.media;
                    audioRef.current.play();
                    audioRef.current.onended = () => {
                        setIsSpeaking(false);
                        // Loop back to listening only if still in listening mode
                        if (isListening && isMounted.current) {
                            startRecording();
                        }
                    };
                } else {
                    setIsSpeaking(false);
                     if (isListening && isMounted.current) startRecording();
                }
            } else {
                if (isListening && isMounted.current) startRecording();
            }
        } else {
             throw new Error('No message content from AI.');
        }

      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: MessageData = {
          role: 'model',
          content: [{text: "I'm sorry, but I encountered an error. The server might be overloaded. Please try again in a moment."}],
        };
        if (isMounted.current) {
            setMessages((prev) => [...prev, errorMessage]);
            if (isListening) startRecording();
        }
      } finally {
        if (isMounted.current) {
            setLoading(false);
        }
      }
  }

  const handleSend = async () => {
    if (input.trim()) {
      processAndSendMessage(input);
      setInput('');
    }
  };
  
  // --- Voice Interaction Logic ---

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context", e));
        audioContextRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    analyserRef.current = null;

  }, []);

  const handleTranscription = async (audioBlob: Blob) => {
        if (!isMounted.current) return;
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            if (!isMounted.current) return;
            const base64Audio = reader.result as string;
            setLoading(true);
            try {
            const { text } = await speechToText({ audio: base64Audio });
            if (text && isMounted.current) {
                await processAndSendMessage(text);
            } else {
                 if (isListening && isMounted.current) startRecording();
            }
            } catch(sttError) {
                console.error("STT Error:", sttError);
                const errorMessage: MessageData = {
                    role: 'model',
                    content: [{text: "I'm sorry, I couldn't understand that. Please try again."}],
                };
                 if (isMounted.current) {
                    setMessages((prev) => [...prev, errorMessage]);
                    if (isListening) startRecording();
                 }
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };
  };

  const startRecording = useCallback(async () => {
     if (!isListening || !isMounted.current) {
        stopRecording();
        return;
    }
     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support audio recording.");
        setIsListening(false);
        return;
    }
    stopRecording();
    audioChunksRef.current = [];
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isListening || !isMounted.current) { // Check again after await
             stream.getTracks().forEach(track => track.stop());
             return;
        }

        audioContextRef.current = new window.AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (audioBlob.size > 1000 && isListening && isMounted.current) { 
                handleTranscription(audioBlob);
            } else {
                 if(isListening && isMounted.current) startRecording(); // restart if blob is empty
            }
        };
        mediaRecorderRef.current.start();
        
        // Inactivity timer
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            if (isListening) {
                console.log("Inactivity timeout, stopping listening mode.");
                setIsListening(false); // Turn off continuous mode
            }
        }, 10000); // 10 seconds of inactivity


        // Silence detection
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let silenceStart = Date.now();

        silenceTimerRef.current = setInterval(() => {
             if (!analyserRef.current) {
                if(silenceTimerRef.current) clearInterval(silenceTimerRef.current);
                return;
            }
            analyserRef.current!.getByteFrequencyData(dataArray);
            const isSilent = dataArray.every(v => v < 5);

            if (!isSilent) {
                silenceStart = Date.now();
                if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            }

            if (isSilent && Date.now() - silenceStart > 1500) { // 1.5 seconds of silence
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }
        }, 300); // Check for silence every 300ms

    } catch (err) {
        console.error("Error accessing microphone:", err);
        setIsListening(false);
    }
  }, [stopRecording, isListening, handleTranscription]);


  const handleMicClick = () => {
    setIsListening(prev => !prev);
  };

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isListening, startRecording, stopRecording]);
  
  // --- Keyboard Shortcut ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
            event.preventDefault();
            setIsOpen(true);
            setIsVoiceOutputEnabled(true);
            setIsListening(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Cleanup on component unmount
  useEffect(() => {
    return () => {
        stopRecording();
        isMounted.current = false;
    }
  }, [stopRecording]);


  // Scroll to bottom effect
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform duration-300 ease-in-out',
          isOpen ? 'scale-0' : 'scale-100'
        )}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-96 h-[36rem] flex flex-col shadow-2xl">
          <CardHeader>
             <div className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Aida</CardTitle>
                    <CardDescription>
                        Ask me anything about your monitors.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
             <div className="flex items-center space-x-2 pt-2">
                <Switch id="voice-mode" checked={isVoiceOutputEnabled} onCheckedChange={setIsVoiceOutputEnabled} />
                <Label htmlFor="voice-mode">Voice Mode</Label>
            </div>
             {isVoiceOutputEnabled && (
                <div className="pt-2">
                    <Label className="text-xs text-muted-foreground">Voice Provider</Label>
                    <RadioGroup 
                        value={voiceProvider} 
                        className="flex items-center gap-4 mt-1" 
                        onValueChange={handleVoiceProviderChange}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gemini" id="gemini" />
                            <Label htmlFor="gemini">Gemini</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="elevenlabs" id="elevenlabs" disabled={!canUseElevenLabs} />
                            <Label htmlFor="elevenlabs" className={cn(!canUseElevenLabs && "text-muted-foreground")}>ElevenLabs</Label>
                        </div>
                    </RadioGroup>
                </div>
             )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4" viewportRef={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' ? 'justify-end' : ''
                    )}
                  >
                    {message.role === 'model' && (
                      <div className="bg-primary text-primary-foreground rounded-full p-2">
                        <MessageCircle size={16} />
                      </div>
                    )}
                    <div
                      className={cn(
                        'p-3 rounded-lg max-w-xs',
                        message.role === 'user'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {message.content.map((part, partIndex) => (
                        <p key={partIndex} className="text-sm">
                          {part.text}
                        </p>
                      ))}
                    </div>
                    {message.role === 'user' && (
                      <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                {loading && !isSpeaking && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <MessageCircle size={16} />
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your message..."}
                disabled={loading || isListening}
              />
               <Button variant="ghost" size="icon" onClick={handleMicClick} disabled={loading || isSpeaking}>
                 {isListening ? <MicOff className="h-5 w-5 text-destructive animate-pulse" /> : <Mic className="h-5 w-5" />}
               </Button>
              <Button onClick={handleSend} disabled={loading || isListening}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
