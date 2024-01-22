import React, {
  useState,
  forwardRef,
  useLayoutEffect,
  useRef,
} from "react";
import style from "./EventFormTeam.module.css";
import { auth } from "../../context/Firebase";
import event_img from "../../assets/event_page/img.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
const EventFormTeam = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const leader = auth.currentUser.email;
  const [participants, setParticipants] = useState([""]);

  const handleParticipantChange = (event, index) => {
    const newParticipants = [...participants];
    newParticipants[index] = event.target.value;
    setParticipants(newParticipants);
  };

  const handleAddParticipant = () => {
    if (participants.length < 4) {
      setParticipants([...participants, ""]);
    }
  };

  let done = false;

  const contactRef = useRef();
  const socialRef = useRef();
  const gridRef = useRef();

  const [array, setArr] = useState([]);

  let checkUsers = async (e) => {
    e.preventDefault();
    try {
      const allEmails = [auth.currentUser.email, ...participants];
      const areEmailsUnique = new Set(allEmails).size === allEmails.length;

      if (!areEmailsUnique) {
        setError("Please make sure all emails are unique");
        return;
      }
      let nArr = await Promise.all(
        participants.map(async (i, p) => {
          const url = process.env.REACT_APP_BASE_URL;
          let response = await fetch(`${url}/auth/checkuser`, {
            method: "post",
            body: JSON.stringify({ email: i }),
            headers: { "Content-Type": "application/json" },
          });
          if (response.ok) return response.ok;
        })
      );

      setArr(nArr);
      const numberOfTrue = nArr.filter((value) => value === true).length;
      if (numberOfTrue != participants.length) {
        setError("not all emails are registered");
      } else {
        setError("");
        navigate("/secondpage", {
          state: { leader: leader, participants: participants },
        });
      }
    } catch (error) {
      console.error("Error in checkUsers:", error);
    }
  };

  useLayoutEffect(() => {
    if (document.documentElement.clientWidth <= 750) {
      if (done == false)
        ref.current.style.height = `${
          ref.current.offsetHeight - socialRef.current.clientHeight
        }px`;
      socialRef.current.style.height = `${
        contactRef.current.clientHeight + 30
      }px`;
      socialRef.current.style.position = "relative";
      socialRef.current.style.top = `-${socialRef.current.clientHeight}px`;
      socialRef.current.style.left = `${
        gridRef.current.clientWidth - socialRef.current.clientWidth
      }px`;
      done = true;
    }
  }, []);

  return (
    <div className={`${style.fwrap} flex-wrapper`} ref={ref}>
      <div className={`${style.gwrap} grid-wrapper`} ref={gridRef}>
        <div className={style.heading}>
          <h1 className={style.event_heading}>Event Registration Form</h1>
          <h4 className={style.event_subheading}>Fill the form to register</h4>
        </div>
        <div className={style.event_img}>
          <img src={event_img} alt="aesthetic-image"></img>
        </div>
        <div className={style.event_form_div}>
          <div>
            <center>
              <h2 className={style.event_heading}>Team Registration</h2>
            </center>
            {error && <p className="text-red">{error}</p>}
            <form className={style.form}>
              <h5>Leader Mail ID: {leader}</h5>
              <br />
              <label>
                Participants Mail IDs :
                {participants.map((participant, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={participant}
                      placeholder="Enter participant's mail id"
                      onChange={(event) =>
                        handleParticipantChange(event, index)
                      }
                    />
                  </div>
                ))}
              </label>
              <br />
              <button type="button" onClick={handleAddParticipant}>
                Add participants <FontAwesomeIcon icon={faPlus} />
              </button>
              <br />
              <button onClick={(e) => checkUsers(e)}> Submit </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EventFormTeam;
