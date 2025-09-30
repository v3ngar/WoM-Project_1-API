const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/', authorize, async (req, res) => {

    
    console.log("notes / GET")
    try {
        const notes = await prisma.notes.findMany();
        res.send({msg: `Notes for user ${req.userData.name}`, notes: notes})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "Error"})
    }

})

router.post('/', authorize, async (req, res) => {
    console.log(req.body)

    try {
        const newNote = await prisma.notes.create({
            data: {
                authorId: req.userData.user,
                note: req.body.note
            }
        })

        res.send({msg: "New note created!"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
    
})

router.put('/:id', async (req, res) => {
    console.log(req.body)

    const updateNote = await prisma.notes.update({
        where: {
          id: req.params.id,
        },
        data: {
          note: req.body.note,
        },
      })

    res.send({msg: `note ${req.params.id} updated`})
})

//start
router.delete('/:id', authorize, async (req, res) => {
    try {
        console.log("Received delete request for ID:", req.params.id);
        console.log("ID length:", req.params.id.length);
        
        // Check if the note exists first
        const existingNote = await prisma.notes.findUnique({
            where: {
                id: req.params.id,
            },
        });
        
        if (!existingNote) {
            console.log("Note not found in database");
            return res.status(404).send({msg: "Note not found"});
        }
        
        console.log("Found note:", existingNote);
        
        const deleteNote = await prisma.notes.delete({
            where: {
                id: req.params.id,
            },
        });

        res.send({msg: `note ${req.params.id} deleted`});
    } catch (error) {
        console.log("Delete error:", error.message);
        console.log("Error code:", error.code);
        res.status(500).send({msg: "Error deleting note"});
    }
});



module.exports = router