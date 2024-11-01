import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode.react";
import "./Scouting.css";
import TeleField from "./Game/Teleop";

function ScoutingForm() {
    const location = useLocation();
    const { match, user } = location.state || {};
    const isNewForm = !match;
    const [formData, setFormData] = useState({
        Name: user ? user.username : '',
        Team: match ? match[`team${match.robot + 1}`] : '',
        Match: match ? match.match_number : '',
        Alliance: match ? match.alliance : '',
        TeleNotes: '',
        checkboxes: Array(8).fill(false),
        TelePoints: [],
        Pcounter: 0,
        counter1: 0,
        counter2: 0,
        climbed: false,
        deliveryCount: 0,
        trapCounter: 0,
        defensivePins: 0,
    });
    const [barcodeData, setBarcodeData] = useState('');
    const [mode, setMode] = useState('teleop');
    const [eraserMode, setEraserMode] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    useEffect(() => {
        const generateBarcode = () => {
            const telePointsCSV = formData.TelePoints.map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};G)`).join(';');
            const missedPointsCSV = formData.TelePoints.filter(point => point.color === 2).map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};O)`).join(';');
            const checkedCheckboxes = formData.checkboxes
                .map((checked, index) => checked ? `CA${index + 1}: ${checked}` : null)
                .filter(Boolean)
                .join(';');
            const greenPointsCount = formData.TelePoints.filter(point => point.color === 1).length;

            const barcodeString = `
                ${user.username || 'NULL'},
                ${formData.Team || 'NULL'},
                ${formData.Match || 'NULL'},
                ${formData.checkboxes.filter(checked => checked).length},
                ${formData.counter1},
                ${formData.TelePoints.filter(point => point.color === 1).length},
                ${formData.defensivePins},
                ${formData.TelePoints.filter(point => point.color === 2).length},
                ${formData.Pcounter},
                ${formData.climbed},
                ${formData.TelePoints.map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};G)`).join(';')},
                ${formData.TelePoints.filter(point => point.color === 2).map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};O)`).join(';')},
                ${formData.deliveryCount},
            `.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

            return barcodeString.replace(/true/g, 'TRUE');
        };

        setBarcodeData(generateBarcode());
    }, [formData, mode, user]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleButtonClick = (index) => {
        const newCheckboxes = [...formData.checkboxes];
        newCheckboxes[index] = !newCheckboxes[index];
        setFormData({ ...formData, checkboxes: newCheckboxes });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendDataToSheet(JSON.stringify(formData));
    };

const sendDataToSheet = (formData) => {
    let teamNumber;

    if (match && match.team_number && !isNaN(parseInt(match.team_number, 10))) {
        teamNumber = parseInt(match.team_number, 10);
    } else {
        if (!formData.Team) {
            alert('Team number must be provided.');
            return;
        }

        const cleanedTeamNumber = formData.Team.replace(/"/g, '').replace(/[()]/g, '');
        teamNumber = parseInt(cleanedTeamNumber, 10);
        if (isNaN(teamNumber) || !teamNumber) {
            alert('Team number must be a valid integer.');
            return;
        }
    }

    const valuesArray = [
        user.username.replace(/"/g, '').replace(/[()]/g, ''),
        teamNumber,
        formData.Match,
        formData.checkboxes.filter(checked => checked).length,
        formData.counter1,
        formData.TelePoints.filter(point => point.color === 1).length,
        formData.defensivePins,
        formData.TelePoints.filter(point => point.color === 2).length,
        formData.Pcounter,
        formData.climbed,
        formData.TelePoints.map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};G)`).join(';'),
        formData.TelePoints.filter(point => point.color === 2).map(point => `(${point.x.toFixed(2)};${point.y.toFixed(2)};O)`).join(';'),
        formData.deliveryCount
    ];
    const username = user.username.replace(/"/g, '').replace(/[()]/g, '');
    const matchNumber = formData.Match;
    const alliance = formData.Alliance;
    const authNumber = Math.floor(1000000 + Math.random() * 9000000);

    alert(`Hello ${username}, we got your submission for match number ${matchNumber} about team ${teamNumber} with alliance ${alliance} successfully. Authentication submission ${authNumber}`);

    const value = removeUnwantedCharacters(JSON.stringify(valuesArray));
    fetch('https://script.google.com/macros/s/AKfycbzxJmqZyvvPHM01FOFTnlGtUFxoslmNOJTUT0QccjLQsK5uQAHHhe_HfYFO2BxyK7Y_/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({ value: value })
    })
        .then(response => {
            console.log('Success:', response);
            setIsButtonDisabled(true); // Disable the button
        })
        .catch(error => console.error('Error:', error));
};
    const removeUnwantedCharacters = (value) => {
        return value.replace(/[{}\[\]]/g, '');
    };

    const handleAutoClick = () => {
        setMode('checkbox');
    };

    const handleTeleopClick = () => {
        setMode('teleop');
    };

    const incrementTrapCounter = () => {
        setFormData(prev => ({ ...prev, trapCounter: prev.trapCounter < 3 ? prev.trapCounter + 1 : prev.trapCounter }));
    };

    const decrementTrapCounter = () => {
        setFormData(prev => ({ ...prev, trapCounter: Math.max(0, prev.trapCounter - 1) }));
    };

    return (
        <div style={{direction: 'rtl', padding: '10px'}}>
            <table className="info-table">
                <thead>
                <tr>
                    <th>שם</th>
                    <th>קבוצה</th>
                    <th>מקצה</th>
                    <th>ברית</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><span className="constant-color name-color">{user.username}</span></td>
                    <td>
                        {isNewForm || ["center", "close", "dar"].includes(match.team_number?.toLowerCase()) ? (
                            <input type="text" name="Team" value={formData.Team} onChange={handleInputChange}/>
                        ) : (
                            <span className="constant-color team-color">{match.team_number}</span>
                        )}
                    </td>
                    <td>
                        {isNewForm ? (
                            <input type="text" name="Match" value={formData.Match} onChange={handleInputChange}/>
                        ) : (
                            <span className="constant-color match-color">{match.match_number}</span>
                        )}
                    </td>
                    <td>
                        {isNewForm ? (
                            <select name="Alliance" value={formData.Alliance} onChange={handleInputChange}>
                                <option value="">Select Alliance</option>
                                <option value="Red">Red</option>
                                <option value="Blue">Blue</option>
                            </select>
                        ) : (
                            <span
                                className={`alliance-button ${formData.Alliance.toLowerCase()}`}>{formData.Alliance}</span>
                        )}
                    </td>
                </tr>
                </tbody>
            </table>
            <form onSubmit={handleSubmit} className="form">
                <textarea
                    id="TeleNotes"
                    name="TeleNotes"
                    value={formData.TeleNotes}
                    onChange={handleInputChange}
                    style={{display: 'none'}}
                />
            </form>

            <h3>מפת סקאוטינג:</h3>

            <div className="button-container">
                <button type="button" className="resizable-button" onClick={handleAutoClick}>Autonomous</button>
                <button type="button" className="resizable-button" onClick={handleTeleopClick}>Teleop</button>
            </div>

            <br/>

            <TeleField
                formData={formData}
                setFormData={setFormData}
                mode={mode}
                eraserMode={eraserMode}
                setEraserMode={setEraserMode}
                incrementCounter1={() => setFormData(prev => ({...prev, counter1: prev.counter1 + 1}))}
                decrementCounter1={() => setFormData(prev => ({...prev, counter1: Math.max(0, prev.counter1 - 1)}))}
                incrementCounter2={() => setFormData(prev => ({...prev, counter2: prev.counter2 + 1}))}
                decrementCounter2={() => setFormData(prev => ({...prev, counter2: Math.max(0, prev.counter2 - 1)}))}
                incrementDeliveryCount={() => setFormData(prev => ({...prev, deliveryCount: prev.deliveryCount + 1}))}
                decrementDeliveryCount={() => setFormData(prev => ({
                    ...prev,
                    deliveryCount: Math.max(0, prev.deliveryCount - 1)
                }))}
                setClimbed={(value) => setFormData(prev => ({...prev, climbed: value}))}
            />

            <br/>

            <div className="toggle-button-container">
                <button
                    type="button"
                    className={`toggle-button ${formData.climbed ? 'active' : 'inactive'}`}
                    onClick={() => setFormData(prev => ({...prev, climbed: !prev.climbed}))}
                >
                    {formData.climbed ? 'הרובוט טיפס' : 'הרובוט לא טיפס'}
                </button>
            </div>
            <div className="counter-container">
                <h3>Trap Counter</h3>
                <div className="counter-buttons">
                    <button className="counter-button" onClick={decrementTrapCounter}>-</button>
                    <span className="counter-value">{formData.trapCounter}</span>
                    <button className="counter-button" onClick={incrementTrapCounter}>+</button>
                </div>
            </div>
            <br/>

            <div className="send-button-container">
                <button
                    type="button"
                    className="send-button"
                    onClick={() => {
                        if (!isButtonDisabled) {
                            sendDataToSheet(formData);
                        }
                    }}
                    disabled={isButtonDisabled}
                >
                    Send Data
                </button>
            </div>
            <br/>

            <div className="qr-code-container">
                <QRCode value={barcodeData}/>
            </div>
        </div>
    );
}

export default ScoutingForm;