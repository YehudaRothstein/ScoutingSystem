import React, { useState, useEffect } from 'react';
import './ManageUsers.css';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newUser, setNewUser] = useState({ username: '', role: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [deletedUserId, setDeletedUserId] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://ScoutingSystem.pythonanywhere.com/users');
                const data = await response.json();
                if (data.status === 'success') {
                    setUsers(data.users);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        try {
            const response = await fetch('https://ScoutingSystem.pythonanywhere.com/add_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setUsers([...users, { ...newUser, user_id: data.user_id }]);
                setNewUser({ username: '', role: '', password: '' });
                setAddSuccess(true);
                setTimeout(() => setAddSuccess(false), 3000); // Show success message for 3 seconds
            } else {
                alert('Failed to add user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add user');
        }
    };

    const handleEditUser = async (userId) => {
        try {
            const response = await fetch('https://ScoutingSystem.pythonanywhere.com/update_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...editingUser, user_id: userId }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setUsers(users.map(user => (user.user_id === userId ? editingUser : user)));
                setEditingUser(null);
                setEditSuccess(true);
                setTimeout(() => setEditSuccess(false), 3000); // Show success message for 3 seconds
            } else {
                alert('Failed to edit user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to edit user');
        }
    };

const handleDeleteUser = async (userId) => {
    try {
        const response = await fetch('https://ScoutingSystem.pythonanywhere.com/delete_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });
        const data = await response.json();
        if (data.status === 'success') {
            setDeletedUserId(userId);
            setTimeout(() => {
                setUsers(users.filter(user => user.user_id !== userId));
                setDeletedUserId(null);
            }, 500); // Delay to allow the fade-out effect
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete user');
    }
};

    const filteredUsers = users.filter(user => user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="manage-users-container">
            <h2>Manage Users</h2>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by username"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">&#128269;</span>
            </div>
            <div className="add-user-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="normal_scouter">Normal Scouter</option>
                    <option value="pit_scouter">Pit Scouter</option>
                    <option value="super_scouter">Super Scouter</option>
                </select>
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <button onClick={handleAddUser}>Add User</button>
                {addSuccess && <p className="success-message">User added successfully!</p>}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.user_id} className={deletedUserId === user.user_id ? 'fade-out' : ''}>
                            <td>
                                {editingUser && editingUser.user_id === user.user_id ? (
                                    <input
                                        type="text"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                ) : (
                                    user.username
                                )}
                            </td>
                            <td>
                                {editingUser && editingUser.user_id === user.user_id ? (
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="normal_scouter">normal\_scouter</option>
                                        <option value="pit_scouter">pit\_scouter</option>
                                        <option value="super_scouter">super\_scouter</option>
                                    </select>
                                ) : (
                                    user.role
                                )}
                            </td>
                            <td>
                                {editingUser && editingUser.user_id === user.user_id ? (
                                    <>
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={editingUser.password}
                                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                        />
                                        <button onClick={() => handleEditUser(user.user_id)}>Save</button>
                                        <button onClick={() => setEditingUser(null)}>Cancel</button>
                                        {editSuccess && <p className="success-message">User edited successfully!</p>}
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEditingUser(user)}>Edit</button>
                                        <button onClick={() => handleDeleteUser(user.user_id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageUsers;