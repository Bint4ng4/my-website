'use client'
import { vapi } from '@/lib/action/vapi.sdk';
import { cn, configureAssistant, getSubjectColor } from '@/lib/utils'
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react'
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from '@/lib/action/companion.actions';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, name, topic, userName,
     userImage, style, voice }: CompanionComponentProps) => {
        const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
        const [isSpeaking, setIsSpeaking] = useState(false);
        const [isMuted, setMuted] = useState(false);
        const [message, setMessage] = useState<SavedMessage[]>([ ]);

        const lottieRef = useRef<LottieRefCurrentProps>(null);

        useEffect(() => {
            if(lottieRef){
                if(isSpeaking) lottieRef.current?.play()
                else lottieRef.current?.stop()
            }
        }, [isSpeaking, lottieRef])

        useEffect(() => {
            const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

            const onCallEnd =() => setCallStatus(CallStatus.FINISHED);
            addToSessionHistory(companionId)

            const onMessage = (message: Message) => {
                if(message.type === 'transcript' && message.transcriptType === 'final')
                {
                    const newMessage = { role: message.role, content: message.transcript}

                    setMessage((prev)=>[newMessage, ...prev])
                }
            }

            const onSpeechStart = () => setIsSpeaking(true)
            const onSpeechEnd = () => setIsSpeaking(false)

            const onError = (error: Error) => console.log('Error',error);

            vapi.on('call-start', onCallStart);
            vapi.on('call-end', onCallEnd);
            vapi.on('message', onMessage);
            vapi.on('error', onError);
            vapi.on('speech-start', onSpeechStart);
            vapi.on('speech-end', onSpeechEnd);

            return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            }
        },[]);
        
        const toggleMicrophone = () => {
            if (callStatus !== CallStatus.ACTIVE) {
                console.warn("The microphone can only be changed during an active session.");
                return;
            }

            try {
                const currentlyMuted = vapi.isMuted();
                vapi.setMuted(!currentlyMuted);
                setMuted(!currentlyMuted);
            } catch (error) {
                console.error("Failed to change microphone status:", error);
            }
        }

        const handleCall = async () =>{
            setCallStatus(CallStatus.CONNECTING)

            const assistantOverride = {
                variableValues: {
                    subject, topic, style
                },
                clientMessages: ['transcript'],
                serverMessages: [],
            }
            //@ts-expect-error
            vapi.start(configureAssistant(voice, style), assistantOverride)
        }

        const handleDisconnect = async () =>{
            setCallStatus(CallStatus.FINISHED)
            vapi.stop()
        }
  return (
    <section className="flex flex-col h-[70vh]">
        <section className="flex gap-8 max-sm:flex-col">
            <div className="companion-section">
            <div className="companion-avatar" style={{backgroundColor: getSubjectColor(subject)}}>
                <div className={cn('absolute transition-ocupacity duration-1001', callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-100' : 'opacity-0', callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse')}>
                    <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit"/>
                </div>
                <div className={cn('absolute transition-ocupacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100': 'opacity-0')}>
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={soundwaves}
                        autoplay={false}
                        className="companion-lottie"
                        />
                    </div>
                    </div>
                <p className="font-bold text-2xl ">{name}</p>
            </div>
            <div className="user-section"> 
                
                <div className="user-avatar">
                    <Image 
                        src={userImage} 
                        alt={userName} 
                        width={130} 
                        height={130} 
                        className="w-auto h-auto rounded-lg " 
                    />
                <p className="font-bold text-2xl text-center"> 
                    {userName}
                </p>
           </div>
            <button 
                className={cn(
                    "btn-mic", 
                    callStatus !== CallStatus.ACTIVE && "opacity-50 cursor-not-allowed"
                )} 
                onClick={toggleMicrophone}
                disabled={callStatus !== CallStatus.ACTIVE} 
            >
                <Image 
                    src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} 
                    alt="mic" 
                    width={36} 
                    height={36} 
                />
                <p className="w-auto h-auto max-sm:hidden">
                    {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                </p>
            </button>
            <button className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white', 
                callStatus === CallStatus.ACTIVE ? 'bg-red-700' 
                : 'bg-primary   ', callStatus === CallStatus.CONNECTING && 'animate-pulse')} 
                onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}>
                {callStatus === CallStatus.ACTIVE 
                ? "End Session"
                : callStatus === CallStatus.CONNECTING
                    ? 'Connecting'
                : 'Start Session'
                }

            </button>
        </div>
         </section>
        <section className="transcript">
            <div className="transcript-message no-scrollbar">
                {message.map((message)=>{
                    if(message.role === 'assistant'){
                        return (
                            <p key={message.content} className="max-sm:text-sm">
                            {name.split(' ')[0].replace('/[.,]/g', '')}; {message.content} 
                            </p>
                        )
                    }else{
                        return <p key={message.content} className="text-primary max-sm:text-sm">
                            {userName}: {message.content}
                        </p>
                    }
                })}
            </div>
            <div className="trascript-fade shrink-0" />
        </section>  
   
    </section>
  )
}

export default CompanionComponent
