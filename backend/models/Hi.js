import mongoose from "mongoose";

const HiSchema = new mongoose.Schema(
    {
        // 1. Simple String field with validation
        name: {
            type: String,
            required: [true, "Name is required for this 'Hi' record."],
            trim: true,
            maxlength: 50
        },
        
        // 2. Number field with limits
        value: {
            type: Number,
            default: 42,
            min: [0, 'Value must be non-negative.'],
            max: [1000, 'Value cannot exceed 1000.']
        },
        
        // 3. Boolean field
        isGreeting: {
            type: Boolean,
            default: true
        },
        
        // 4. Array of strings (e.g., tags)
        tags: [
            {
                type: String,
                lowercase: true,
                trim: true
            }
        ],
        
        // 5. Date field
        dateLogged: {
            type: Date,
            default: Date.now
        }
    },
    { 
        // Automatically adds createdAt and updatedAt fields
        timestamps: true 
    }
);

// Optional: Export the Model for use
const Hi = mongoose.model('Hi', HiSchema);
fun()

const fun = async ()=>{
    await Hi.insertOne({
        name : "Hello"
    });
    console.log("Added ");
}
export default Hi;