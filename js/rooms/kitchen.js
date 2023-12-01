// js/rooms/Kitchen.js
import { Room } from '../core/room.js';
import { Item } from '../core/item.js';

const description = `
You are in a cozy, well-lit kitchen. The aroma of baked bread fills the air. 
There's a wooden table in the center, with a few chairs around it. 
Cabinets line the walls, and a window over the sink offers a view of the garden outside.
`;

// Define non-portable items (like window and table) and portable items (like bread)

// Non-portable: Window
const window = new Item(
    "window",
    "A large window that looks out to the garden. It's currently closed.",
    {
        open: function() {
            this.updateStateDescription("Sunlight fills the room through the open window.");
            return "You open the window, letting in a breath of fresh air.";
        },
        close: function() {
            this.updateStateDescription("");
            return "You close the window.";
        }
    },
    false // Non-portable
);

// Non-portable: Table
const table = new Item(
    "table",
    "A sturdy wooden table, well-used and polished to a shine.",
    {
        look: () => "The table is set for a meal, but no one is around."
    },
    false // Non-portable
);

// Portable: Bread
const bread = new Item(
    "bread",
    "A freshly baked loaf of bread, still warm from the oven.",
    {
        eat: () => "You eat a piece of the bread. It's delicious!"
    },
    true, // Portable
);

// Create and export the kitchen room with items
export const kitchen = new Room(description, { /* exits */ }, [bread, window, table]);
