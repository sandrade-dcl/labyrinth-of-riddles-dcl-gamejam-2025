import { CameraModeArea, CameraType, engine, Entity, EntityUtils, Transform } from '@dcl/sdk/ecs'
import { getActionEvents, getTriggerEvents } from '@dcl/asset-packs/dist/events'
import { hideLoserUI, hideRiddleUI, hideWinnerUI, setupTimeCounter, setupUI, showRiddleUI, showWinnerUI } from './ui'
import { TriggerType } from '@dcl/asset-packs'
import { Door } from './Door'
import { riddlesList } from './riddlesList'
import { movePlayerTo, triggerEmote } from '~system/RestrictedActions'
import { Vector3 } from '@dcl/sdk/math'

const secondsLeft = 300
let doors: Door[] = []
let firstPersonCameraAreaEntity: Entity | null = null
let thirdPersonCameraAreaEntity: Entity | null = null

export function main() {
    firstPersonCameraAreaEntity = createCameraArea(CameraType.CT_FIRST_PERSON)
    thirdPersonCameraAreaEntity = createCameraArea(CameraType.CT_THIRD_PERSON)
    setupUI()
    setupGoalArea()
    setupTimeCounter(secondsLeft)
    setPlayerCamera(CameraType.CT_FIRST_PERSON)
    setupDoors()
    moveAtTheBegining()
}

export function openDoor(id: number) {
    doors[id].doorActions.emit('Play Sound', {})
    doors[id].doorActions.emit('Play Open Animation', {})
    doors[id].isRiddleSolved = true

    if (doors[id].isDeadEnd) {
        triggerEmote({ predefinedEmote: 'shrug' })
    } else {
        // Randomly choose between handsair and dab
        const randomNumber = Math.random()
        if (randomNumber < 0.5) {
            triggerEmote({ predefinedEmote: 'handsair' })
        } else {
            triggerEmote({ predefinedEmote: 'dab' })
        }
    }
}

export function restartGame() {
    moveAtTheBegining()
    setPlayerCamera(CameraType.CT_FIRST_PERSON)
    setupDoors()
    hideWinnerUI()
    hideLoserUI()
    setupTimeCounter(secondsLeft)

    doors.forEach(door => {
        door.doorActions.emit('Play Close Animation', {})
    })
}

function moveAtTheBegining() {
    const initialPosition = Vector3.create(3, 0, 3)
    const initialDirection = Vector3.subtract(initialPosition, Transform.getMutable(doors[0].doorEntity).position)

    movePlayerTo({
        newRelativePosition: initialPosition,
        cameraTarget: initialDirection,
        avatarTarget: initialDirection,
    })
}

function setupDoors() {
    doors = riddlesList.map(riddle => ({
        id: riddle.id,
        doorEntity: engine.getEntityOrNullByName(`Door${riddle.id}`),
        riddleAreaEntity: engine.getEntityOrNullByName(`RiddleArea${riddle.id}`),
        riddleQuestion: riddle.riddleQuestion,
        riddleAnswer: riddle.riddleAnswer,
        riddleHint: riddle.hint,
        doorActions: {},
        isRiddleSolved: false,
        isDeadEnd: riddle.isDeadEnd,
    }))

    doors.forEach(door => {
        if (door.doorEntity && door.riddleAreaEntity) {
            door.doorActions = getActionEvents(door.doorEntity)
            
            const areaTriggerEvents = getTriggerEvents(door.riddleAreaEntity)
            areaTriggerEvents.off(TriggerType.ON_PLAYER_ENTERS_AREA)
            areaTriggerEvents.on(TriggerType.ON_PLAYER_ENTERS_AREA, () => {
                if (!door.isRiddleSolved) {
                    showRiddleUI(door.id, door.riddleQuestion, door.riddleAnswer, door.riddleHint)
                    setPlayerCamera(CameraType.CT_THIRD_PERSON)
                }
            })
    
            areaTriggerEvents.off(TriggerType.ON_PLAYER_LEAVES_AREA)
            areaTriggerEvents.on(TriggerType.ON_PLAYER_LEAVES_AREA, () => {
                hideRiddleUI()
                setPlayerCamera(CameraType.CT_FIRST_PERSON)
            })
        }
    })
}

function setupGoalArea() {
    const goalAreaEntity = engine.getEntityOrNullByName(`GoalArea`)
    if (goalAreaEntity) {
        const goalAreaTriggerEvents = getTriggerEvents(goalAreaEntity)
        goalAreaTriggerEvents.on(TriggerType.ON_PLAYER_ENTERS_AREA, () => {
            showWinnerUI()
            setPlayerCamera(CameraType.CT_THIRD_PERSON)
            triggerEmote({ predefinedEmote: 'handsair' })
        })
    }
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
