import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState('javascript');
    
    async function runCode() {
        const source_code = codeRef.current || '';
        const language_id = language === 'python' ? 71 : 63; // 71 = Python 3, 63 = JavaScript (Node.js)

        const encodedCode = btoa(source_code); // base64 encode

        try {
            const { data: submission } = await axios.post(
                'https://judge0-ce.p.rapidapi.com/submissions',
                {
                    source_code: encodedCode,
                    language_id: language_id,
                    encode: true,
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'X-RapidAPI-Key': 'c7cc39dca6msh13c55688152137ep1095fejsn4601d795a6bc', // Replace with your API key
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    },
                }
            );

            const token = submission.token;

            // Poll result
            const interval = setInterval(async () => {
                const result = await axios.get(
                    `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
                    {
                        headers: {
                            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
                            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                        },
                    }
                );

                const status = result.data.status.description;

                if (status !== 'In Queue' && status !== 'Processing') {
                    clearInterval(interval);
                    const output = atob(result.data.stdout || '') || 'No output';
                    toast.success(`Output: ${output}`);
                    console.log('Execution result:', output);
                }
            }, 1000);
        } catch (error) {
            toast.error('Execution failed');
            console.error(error);
        }
    }


    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }
    function downloadCode() {
        const code = codeRef.current || '';
        const extension = language === 'python' ? 'py' : 'js';
        const mimeType = language === 'python' ? 'text/x-python' : 'text/javascript';
    
        const blob = new Blob([code], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `script.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    function runCode() {
        const code = codeRef.current || '';
        try {
            // Safe-ish for JS demos (do NOT use with untrusted code in real apps!)
            // eslint-disable-next-line no-eval
            const result = eval(code);
            toast.success(`Output: ${result}`);
            console.log('Execution result:', result);
        } catch (error) {
            toast.error('Error in execution');
            console.error('Execution error:', error);
        }
    }
    

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <div className='buttonGroup'>
                    <button className="btn copyBtn" onClick={copyRoomId}>
                        Copy ROOM ID
                    </button>
                    <button className="btn leaveBtn" onClick={leaveRoom}>
                        Leave
                    </button>
                    <button className="btn downloadBtn" onClick={downloadCode}>
                        Save File
                    </button>
                    <button className="btn runBtn" onClick={runCode}>
                        Run 
                    </button>
                    <select
                        className="languageSelect"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>

                </div>
            </div>
            <div className="editorWrap">
                <Editor 
                    socketRef={socketRef} 
                    roomId={roomId}
                    onCodeChange={(code) => {
                    codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;