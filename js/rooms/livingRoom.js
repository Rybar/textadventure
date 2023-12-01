// js/rooms/LivingRoom.js
import { Room } from '../core/room.js';
import { Item } from '../core/item.js';

const description = `
You are in a spacious and luxuriously furnished living room. Sunlight streams through large windows, 
casting warm patterns on the polished wooden floor. A comfortable sofa set surrounds an ornate coffee table,
perfect for relaxing or reading. A grand fireplace adds a cozy ambiance to the room, 
and a large painting adds a touch of elegance. The walls are lined with bookshelves, 
and a small writing desk sits in one corner, its surface neat and tidy.
`;

// Non-portable: Fireplace
const fireplace = new Item(
    "fireplace",
    "An impressive stone fireplace, currently not lit.",
    {
        light: function() {
            this.updateDescription("An impressive stone fireplace, now lit with a warm, crackling fire.");
            this.updateStateDescription("The room is bathed in the warm glow and soothing crackle of the fireplace.");
            return "You light the fire, filling the room with a comforting warmth.";
        },
        extinguish: function() {
            this.updateDescription("An impressive stone fireplace, currently not lit.");
            this.updateStateDescription("");
            return "You extinguish the fire, and the room returns to a quiet state.";
        }
    },
    false // Non-portable
);

// Portable: Book
const book = new Item(
    "book",
    "A leather-bound book titled 'Tales of Forgotten Realms'.",
    {
        read: () => "You open the book and immerse yourself in stories of mystical lands and ancient heroes."
    },
    true // Portable
);

// Non-portable: Painting
const painting = new Item(
    "painting",
    "A captivating landscape painting depicting a serene mountain valley.",
    {
        look: () => "As you gaze at the painting, you're struck by its depth and the vividness of its colors."
    },
    false // Non-portable
);

// Non-portable: Writing Desk
const writingDesk = new Item(
    "writing desk",
    "An elegant wooden desk with various papers and a fountain pen neatly arranged on it.",
    {
        use: () => "You sit at the desk and pen a brief note on the crisp stationery."
    },
    false // Non-portable
);

// Create and export the living room
export const livingRoom = new Room(description, { /* exits */ }, [fireplace, book, painting, writingDesk]);
