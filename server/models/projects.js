import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
    {
        name: {type: String,required: true, trim: true, minlength: 3},
        description: {type: String, default: ''},
        teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    {timestamps: true}
)

const Project = mongoose.model('Project', projectSchema)

export default Project