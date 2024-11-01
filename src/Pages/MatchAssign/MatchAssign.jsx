import React, { useState, useEffect } from 'react';
import './MatchAssign.css';

function MatchAssign() {
    const [matches, setMatches] = useState([]);
    const [scouters, setScouters] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch('https://ScoutingSystem.pythonanywhere.com/matches');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMatches(data.matches);
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch('https://ScoutingSystem.pythonanywhere.com/users');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setScouters(data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchMatches();
        fetchUsers();
    }, []);

    const handleScouterChange = (matchId, scouterIndex, userId) => {
        setMatches(matches.map(match => {
            if (match.id === matchId) {
                return { ...match, [`scouter${scouterIndex}`]: userId };
            }
            return match;
        }));
    };

    const handleManualAssign = async () => {
        try {
            const response = await fetch('https://ScoutingSystem.pythonanywhere.com/manual_assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matches }),
            });
            const data = await response.json();
            console.log('Manual Assign Response:', data);
            if (data.status === 'success') {
                alert('Assignments saved successfully');
            } else {
                alert('Failed to save assignments');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save assignments');
        }
    };

    const handleReassign = async () => {
        try {
            const response = await fetch('https://ScoutingSystem.pythonanywhere.com/reassign_scouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log('Reassign Response:', data);
            if (data.status === 'success') {
                setMatches(data.matches); // Update the matches with reassigned scouters
                alert('Scouters reassigned successfully');
            } else {
                alert('Failed to reassign scouters');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to reassign scouters');
        }
    };

    return (
        <div className="match-assign-container">
            <header>
                <h2>Match Assignment</h2>
                <button onClick={handleManualAssign} className="save-button">Save Assignments</button>
                <button onClick={handleReassign} className="reassign-button">Reassign Scouters</button>
            </header>
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Match Number</th>
                        <th>Scouter 1</th>
                            <th>Scouter 2</th>
                            <th>Scouter 3</th>
                            <th>Scouter 4</th>
                            <th>Scouter 5</th>
                            <th>Scouter 6</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map(match => (
                            <tr key={match.id}>
                                <td>{match.id}</td>
                                {[1, 2, 3, 4, 5, 6].map(index => (
                                    <td key={index}>
                                        <select
                                            value={match[`scouter${index}`] || ""}
                                            onChange={(e) => handleScouterChange(match.id, index, e.target.value)}
                                        >
                                            <option value="">Select Scouter</option>
                                            {scouters.map(scouter => (
                                                <option key={scouter.user_id} value={scouter.user_id}>
                                                    {scouter.username}
                                                </option>
                                            ))}
                                        </select>
                                        <div>{match[`team${index}`]}</div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <footer>

            </footer>
        </div>
    );
}

export default MatchAssign;