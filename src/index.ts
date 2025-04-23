import { engine } from '@dcl/sdk/ecs'
import { getActionEvents, getTriggerEvents } from '@dcl/asset-packs/dist/events'
import { hideRiddleUI, setupRiddlesUI, showRiddleUI } from './riddles-ui'
import { TriggerType } from '@dcl/asset-packs'
import { Door } from './Door'

const riddlesList = [
    {
        id: 0,
        riddleQuestion: 'I have pages but I’m not a tree, and in me you can find lots of knowledge. What am I?',
        riddleAnswer: 'Book',
    },
    {
        id: 1,
        riddleQuestion: 'I always move forward but never backward. What am I?',
        riddleAnswer: 'Time',
    }
]

let doors: Door[] = []

export function main() {
    setupRiddlesUI();
    setupDoors();
}

export function openDoor(id: number) {
    doors[id].doorActions.emit('Play Sound', {})
    doors[id].doorActions.emit('Play Open Animation', {})
    doors[id].isRiddleSolved = true
}

function setupDoors() {
    doors = riddlesList.map(riddle => ({
        id: riddle.id,
        doorEntity: engine.getEntityOrNullByName(`Door${riddle.id}`),
        riddleAreaEntity: engine.getEntityOrNullByName(`RiddleArea${riddle.id}`),
        riddleQuestion: riddle.riddleQuestion,
        riddleAnswer: riddle.riddleAnswer,
        doorActions: {},
        isRiddleSolved: false,
    }))

    doors.forEach(door => {
        if (door.doorEntity && door.riddleAreaEntity) {
            console.log('SANTI: ' + door.id)
            door.doorActions = getActionEvents(door.doorEntity)
            
            const areaTriggerEvent = getTriggerEvents(door.riddleAreaEntity)
            areaTriggerEvent.on(TriggerType.ON_PLAYER_ENTERS_AREA, () => {
                if (!door.isRiddleSolved) {
                    showRiddleUI(door.id, door.riddleQuestion, door.riddleAnswer)
                }
            })
    
            areaTriggerEvent.on(TriggerType.ON_PLAYER_LEAVES_AREA, () => {
                hideRiddleUI()
            })
        }
    })
}