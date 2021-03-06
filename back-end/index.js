const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const pool = require('./config');
const app = express();


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000;

const mRouter = require('./routes/message');

const server = http.createServer(app);
const io = socketio(server);

app.use(mRouter);
app.use(cors());
app.use(express.json());


// users
app.post("/add_users", async (req, res) => {
    try {
        const { name, username, location, email, phone, short_bio, picture } = req.body;
        const newUser = await pool.query(`
            INSERT INTO users (name, username, location, email, phone, short_bio, picture) 
            VALUES ($1,$2,$3,$4, $5,$6, $7) returning *`,
            [name, username, location, email, phone, short_bio, picture]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        res.json({ error: 'User already exists.' })
        console.error(err.message);
    }
});

// get ALL profile data
app.get("/user_profile", async (req, res) => {
    try {
        const userInfo = await pool.query("SELECT * FROM users");
        res.json(userInfo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// get USER profile data
app.get("/user_profile/:email", async (req, res) => {
    try {
        const { email } = req.params
        const userProfile = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        res.json(userProfile.rows[0])
    } catch (err) {
        console.error(err.message)
    }
});

// profile
app.put("/update_user", async (req, res) => {
    try {
        // const {id} = req.params;
        const { name, userName, location, phone, shortBio, email } = req.body;
        const editUser = await pool.query(`
            UPDATE users SET (name, username, location, phone, short_bio, email) = ($1, $2, $3, $4, $5, $6) 
            WHERE email = $6 returning *`,
            [name, userName, location, phone, shortBio, email]);
        res.json(editUser.rows[0]);

    } catch (err) {
        console.error(err.message);
    }
});

// all deeds
app.get("/deeds/", async (req, res) => {
    try {
        // filter status conditions
        const { status, assignerId } = req.query;
        console.log(assignerId);
        const allDeeds = await pool.query(`
            SELECT 
                d.id, d.category, d.title, d.description, d.location, d.date_created, 
                d.date_todo, d.status, u.name, u.username, u.picture, u.email 
            FROM deeds AS d 
            JOIN users AS u 
            ON d.assigner_id=u.id
            AND d.status='${status}' 
            AND d.assigner_id!=${assignerId}
            ;`);
        res.send(allDeeds.rows);
    } catch (err) {
        console.log(err.message);
    }
});

// SPECIFIC deed
app.get("/deed/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deed = await pool.query(`
        SELECT
            d.id, d.category, d.title, d.description, d.location, d.date_created, 
            d.date_todo, d.status, d.assigner_id, u.name, u.username, u.picture, u.email 
        FROM deeds AS d 
        JOIN users AS u 
        ON d.assigner_id=u.id 
        WHERE d.id =$1`, [id])
        res.json(deed.rows[0]);
    } catch (err) {
        console.error(err.message)
    }
});
// m-t-m relationship
// app.get("/deed/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deed = await pool.query(`
//         SELECT d.*
//         FROM deeds AS d
//         JOIN users_deeds ud ON d.id = ud.deeds_id
//         JOIN users u ON u.id = ud.assigner_id
//         WHERE ud.id =$1`, [id])
//         res.json(deed.rows[0]);
//     } catch (err) {
//         console.error(err.message)
//     }
// });


// create a deed
app.post("/create_deed", async (req, res) => {
    try {
        const { title, description, category, deedLocation, status, assignerId, dateTodo, dateCreated } = req.body;
        const newDeed = await pool.query(`
            INSERT INTO deeds (
                title, description, category, location, status, 
                assigner_id, date_todo, date_created) 
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
                returning *`,
            [title, description, category, deedLocation, status, assignerId, dateTodo, dateCreated]
        );
        res.json(newDeed.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

//edit a deed
// app.put("/edit_deed", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, description, category, location, status } = req.body;
//         const editDeed = await pool.query("UPDATE deeds SET (title, description, category, location, status) = ($1,$2,$3,$4,$5) WHERE id = $6", [title, description, category, location, status, id]);
//         res.json("Deed was updated.");
//     } catch (err) {
//         console.error(err.message);
//     }
// })

// edit a deed
app.put("/edit_deed", async (req, res) => {
    try {
        const { title, description, category, location, status, id } = req.body;
        const editDeed = await pool.query(`
            UPDATE deeds SET (title, description, category, location, status) = ($1,$2,$3,$4,$5) 
            WHERE id = $6`,
            [title, description, category, location, status, id]);
        res.json("Deed was updated.");
    } catch (err) {
        console.error(err.message);
    }
})

// edit status
app.put("/change_status", async (req, res) => {
    try {
        const { status, id, userId } = req.body;
        const editStatus = await pool.query(`
            UPDATE deeds SET status = $1
            WHERE id = $2`,
            [status, id]);
        const assignedUser = await pool.query(`
            INSERT INTO users_deeds (assigned_id, deeds_id)
            VALUES ($1, $2)
            ON CONFLICT (assigned_id, deeds_id) 
            DO NOTHING;`,
            [userId, id]);
        res.json("Accepted.");

    } catch (err) {
        console.error(err.message);
    }
})


//deed shown based on status
// app.get("/deeds/status", async (req, res) => {
//     try {

//         const openDeeds = await pool.query("SELECT d.deeds_id, d.category, d.title, d.description, d.location, d.date_created, d.date_todo, d.status, u.name, u.username, u.picture, u.email FROM deeds AS d JOIN users AS u ON d.users_id=u.users_id AND d.status='open';");
//         res.send(openDeeds.rows);
//     } catch (err) {
//         console.log(err.message);
//     }
// });



// delete a deed
app.delete("/deed/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteDeed = await pool.query("DELETE FROM deeds WHERE id = $1", [id]);
        res.json("Deed was deleted.")
    } catch (err) {
        console.error(err.messsage);
    }
})



// chat
io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room} room. ` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined! ` });

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        };
    });
});


server.listen(PORT, () => console.log(`server is running on http://localhost:${PORT}`));
