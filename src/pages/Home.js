
import React, { useState } from "react";
import{v4 as uuidV4} from 'uuid';
import toast from "react-hot-toast";
import { useNavigate  } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [roomId , setRoomId] = useState('');

  const [username , setUsername] = useState('');

  const CreateNewRoom = (e) => {
    e.preventDefault();

    const id = uuidV4();

    setRoomId(id);
    toast.success('Created New Room');

  };

  const joinRoom = () => {
    if (!roomId || !username){
      toast.error('Please enter Room ID or Username');
      return;    
    }
    
    //Redirect
    navigate('/editor/${roomId}',{
      state:{
        username,
      },
    });
  }

  return <div className="homePageWrapper"> 
    <div className="formWrapper">
      <img  className = "homePageLogo" src = "/code-sync.png" alt = "code-sync-logo" width={400}/>
      <h4 className="mainLabel">Page invitation ROOM ID</h4>
      <div className="inputGroup ">

        <input type="text" 
          className="inputBox" 
          placeholder="ROOM ID"
          value={roomId} 
          onChange={(e)=> setRoomId(e.target.value)}>

         </input>
        <input type="text"
         className="inputBox" 
         placeholder="User Name" 
         value={username} 
         onChange={(e)=> setUsername(e.target.value)}>

         </input>

        <button className="btn joinbtn" onClick={joinRoom}>Join</button>
        <span className="createInfo">
          Create :&nbsp;
          <a  onClick = {CreateNewRoom} className="createNewbtn">new room</a>
        </span>
      </div>
    </div>
    <footer>
      <h4>Project built by RAHUL</h4>
    </footer>

  </div>;
};

export default Home