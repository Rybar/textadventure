export function createGameMapDefinition() {
  return {
    rooms: {
      cavern: { x: 0, y: 2, region: 'approach' },
      fernGarden: { x: -1, y: 1, region: 'approach' },
      fishingShack: { x: -2, y: 1, region: 'approach' },
      grandStairs: { x: 0, y: 1, region: 'approach' },
      pitLedge: { x: 1, y: 2, region: 'hidden' },
      cesspool: { x: 2, y: 3, region: 'hidden' },
      foyer: { x: 0, y: 0, region: 'public' },
      sittingRoom: { x: -1, y: 0, region: 'public' },
      feastHall: { x: 0, y: -1, region: 'public' },
      secretCircle: { x: -1, y: -1, region: 'hidden' },
      kitchen: { x: 1, y: -1, region: 'service' },
      alchemyStockroom: { x: 2, y: -1, region: 'hidden' },
      blackWindTreeChamber: { x: 3, y: -1, region: 'hidden' },
      ogreBeds: { x: 1, y: -2, region: 'service' },
      kelagoRoom: { x: 0, y: -2, region: 'family' },
      grandfatherRoom: { x: 1, y: -2, region: 'family' },
      plumRoom: { x: 1, y: -3, region: 'hidden' },
      library: { x: 2, y: -3, region: 'hidden' },
      trophyRoom: { x: 3, y: -3, region: 'hidden' },
      spiderRoom: { x: 4, y: -3, region: 'hidden' },
      sealedRoom: { x: 4, y: -4, region: 'hidden' },
      foldedHallway: { x: 2, y: -4, region: 'hidden' },
      tunnel: { x: 2, y: -5, region: 'hidden' },
      guestRoom: { x: 1, y: 1, region: 'guest' },
      nathemaRoom: { x: 2, y: 1, region: 'guest' },
      bathroom: { x: 2, y: 2, region: 'guest' },
    },
  };
}

export default createGameMapDefinition;