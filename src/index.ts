import { CameraModeArea, CameraType, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { getActionEvents, getTriggerEvents } from '@dcl/asset-packs/dist/events'
import { hideRiddleUI, setupRiddlesUI, showRiddleUI } from './riddles-ui'
import { TriggerType } from '@dcl/asset-packs'
import { Door } from './Door'
import { riddlesList } from './riddlesList'
import { triggerEmote } from '~system/RestrictedActions'
import { Vector3 } from '@dcl/sdk/math'

let doors: Door[] = []
let firstPersonCameraAreaEntity: Entity | null = null
let thirdPersonCameraAreaEntity: Entity | null = null

export function main() {

    firstPersonCameraAreaEntity = createCameraArea(CameraType.CT_FIRST_PERSON);
    thirdPersonCameraAreaEntity = createCameraArea(CameraType.CT_THIRD_PERSON);
    setPlayerCamera(CameraType.CT_FIRST_PERSON)

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
            door.doorActions = getActionEvents(door.doorEntity)
            
            const areaTriggerEvent = getTriggerEvents(door.riddleAreaEntity)
            areaTriggerEvent.on(TriggerType.ON_PLAYER_ENTERS_AREA, () => {
                if (!door.isRiddleSolved) {
                    showRiddleUI(door.id, door.riddleQuestion, door.riddleAnswer)
                    setPlayerCamera(CameraType.CT_THIRD_PERSON)
                }
            })
    
            areaTriggerEvent.on(TriggerType.ON_PLAYER_LEAVES_AREA, () => {
                hideRiddleUI()
                setPlayerCamera(CameraType.CT_FIRST_PERSON)
            })
        }
    })
}

function createCameraArea(cameraType: CameraType) : Entity {
    const cameraAreaEntity = engine.addEntity()

    Transform.createOrReplace(cameraAreaEntity, {
        parent: engine.PlayerEntity,
        position: Vector3.create(0, 0, 0),
    })

    CameraModeArea.createOrReplace(cameraAreaEntity, {
        area: Vector3.create(5, 5, 5),
        mode: cameraType
    })

    return cameraAreaEntity
}

function setPlayerCamera(cameraType: CameraType) {
    Transform.getMutable(firstPersonCameraAreaEntity!).position = Vector3.create(0, cameraType == CameraType.CT_FIRST_PERSON ? 0 : 100, 0)
    Transform.getMutable(thirdPersonCameraAreaEntity!).position = Vector3.create(0, cameraType == CameraType.CT_THIRD_PERSON ? 0 : 100, 0)
}