import { Room } from '../core/room.js';
import { Item } from '../core/item.js';

const description = `
You are in a spacious living room with comfortable sofas and a large fireplace. 
The walls are adorned with various paintings, and a large bookshelf stands in one corner.
A soft rug covers the wooden floor, and a coffee table sits in the center of the room.
Large windows allow sunlight to pour in, creating a warm and welcoming atmosphere.
`;

// Define items in the living room
const book = new Item(
    "book",
    "An old leather-bound book, its pages yellowed with age.",
    {
        read: () => "You open the book and start reading. It's a fascinating story!"
        // Add more actions as needed
    }
);

const painting = new Item(
    "painting",
    "A beautiful landscape painting, depicting a serene mountain view.",
    {
        look: () => "You admire the painting. The attention to detail is impressive."
        // Add more actions as needed
    }
);

// Create and export the living room
export const livingRoom = new Room(description, { /* exits */ }, [book, painting]);
