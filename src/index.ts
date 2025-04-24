import { CameraModeArea, CameraType, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { getActionEvents, getTriggerEvents } from '@dcl/asset-packs/dist/events'
import { hideRiddleUI, setupRiddlesUI, showRiddleUI } from './riddles-ui'
import { TriggerType } from '@dcl/asset-packs'
import { Door } from './Door'
import { riddlesList } from './riddlesList'
import { triggerEmote } from '~system/RestrictedActions'
import { Vector3 } from '@dcl/sdk/math'

let doors: Door[] = []

export function main() {

    createCameraArea(CameraType.CT_FIRST_PERSON);
    setupRiddlesUI();
    setupDoors();
}

export function openDoor(id: number) {
    doors[id].doorActions.emit('Play Sound', {})
    doors[id].doorActions.emit('Play Open Animation', {})
    doors[id].isRiddleSolved = true

    if (doors[id].isDeadEnd) {
        triggerEmote({ predefinedEmote: 'shrug' })
    } else {
        triggerEmote({ predefinedEmote: 'handsair' })
    }
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
        isDeadEnd: riddle.isDeadEnd,
    }))

    doors.forEach(door => {
        if (door.doorEntity && door.riddleAreaEntity) {
            console.log('SANTI DOOR ID: ' + door.id)
            door.doorActions = getActionEvents(door.doorEntity)
            
            const areaTriggerEvent = getTriggerEvents(door.riddleAreaEntity)
            areaTriggerEvent.on(TriggerType.ON_PLAYER_ENTERS_AREA, () => {
                if (!door.isRiddleSolved) {
                    showRiddleUI(door.id, door.riddleQuestion, door.riddleAnswer)
                    createCameraArea(CameraType.CT_THIRD_PERSON)
                }
            })
    
            areaTriggerEvent.on(TriggerType.ON_PLAYER_LEAVES_AREA, () => {
                hideRiddleUI()
                createCameraArea(CameraType.CT_FIRST_PERSON)
            })
        }
    })
}

function createCameraArea(cameraType: CameraType) {
    CameraModeArea.createOrReplace(engine.PlayerEntity, {
        area: Vector3.create(5, 5, 5),
        mode: cameraType
    })
}