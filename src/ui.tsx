import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity, Input, Button } from '@dcl/sdk/react-ecs'
import { openDoor, restartGame } from '.'
import { engine, SystemFn } from '@dcl/sdk/ecs'
import { triggerEmote } from '~system/RestrictedActions'

let riddleId = 0
let isRiddleUIVisible = false
let isRiddleHintVisible = false
let riddleQuestion = ''
let riddleHint = ''
let riddleAnswer = ''
let userAnswer = ''
let riddleSolved = false
let hasWon = false
let hasLost = false
let secondsLeft = 90
let timerSystem: SystemFn | null = null

export function setupUI() {
    ReactEcsRenderer.setUiRenderer(uiComponent)
}

export function showRiddleUI(id: number, question: string, answer: string, hint: string) {
    if (hasLost) { return }
    riddleId = id
    isRiddleUIVisible = true
    isRiddleHintVisible = false
    riddleQuestion = question
    riddleAnswer = answer
    riddleHint = hint
    userAnswer = ''
    riddleSolved = false
}

export function hideRiddleUI() {
    isRiddleUIVisible = false
    isRiddleHintVisible = false
}

export function showWinnerUI() {
    if (hasLost) { return }
    hasWon = true
}

export function hideWinnerUI() {
    hasWon = false
}

export function showLoserUI() {
    hasLost = true
    hideRiddleUI()
}

export function hideLoserUI() {
    hasLost = false
}

export function setupTimeCounter(seconds: number) {
    secondsLeft = seconds
    
    // Clear any existing timer
    if (timerSystem !== null) {
        engine.removeSystem(timerSystem)
        timerSystem = null
    }
    
    // Create new timer system
    timerSystem = (dt: number) => {
        if (secondsLeft > 0) {
            secondsLeft -= dt
            if (secondsLeft <= 0) {
                secondsLeft = 0
                showLoserUI()
                if (timerSystem !== null) {
                    engine.removeSystem(timerSystem)
                    timerSystem = null
                }
            }
        }
    }
    engine.addSystem(timerSystem)
}

const uiComponent = () => (
    [
        RestartButton(),
        HintButton(),
        RiddleText(),
        RiddleHintText(),
        RiddleAnswerInput(),
        WinnerText(),
        LoserText(),
        TimerText(),
    ]
)

function RestartButton() {
    return <UiEntity
        uiTransform={{
            width: 300,
            height: 60,
            positionType: 'absolute',
            position: { top: 30, right: 0 },
        }}
    >
        <Button
            value="RESTART GAME"
            fontSize={20}
            variant="primary"
            uiTransform={{ width: 200, height: 60 }}
            onMouseDown={() => {

            }}
            onMouseUp={() => {
                restartGame()
            }}
        />
    </UiEntity>
}

function HintButton() {
    return <UiEntity
        uiTransform={{
            display: isRiddleUIVisible && !riddleSolved ? 'flex' : 'none',
            width: 300,
            height: 60,
            positionType: 'absolute',
            position: { top: 100, right: 0 },
        }}
    >
        <Button
            uiBackground={{ color: Color4.Purple() }}
            value="GIVE ME A HINT"
            fontSize={20}
            variant="primary"
            uiTransform={{ width: 200, height: 60 }}
            onMouseDown={() => {

            }}
            onMouseUp={() => {
                isRiddleHintVisible = true
                secondsLeft -= 20
                triggerEmote({ predefinedEmote: 'dontsee' })
            }}
        />
    </UiEntity>
}

function RiddleText() {
    return <UiEntity
        uiTransform={{
            display: isRiddleUIVisible ? 'flex' : 'none',
            width: '50%',
            height: 110,
            positionType: 'absolute',
            position: { top: 150, left: '25%' },
            margin: '0',
            padding: 4,
        }}
        uiBackground={{ color: Color4.fromHexString("#4d544e") }}
    >
        <UiEntity
            uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            uiBackground={{ color: Color4.fromHexString("#4d814e") }}
        >
            <Label
                value={riddleQuestion}
                fontSize={20}
                uiTransform={{ width: '100%', height: 80 } }
                textAlign='middle-center'
            />
        </UiEntity>
    </UiEntity>
}

function RiddleHintText() {
    return <UiEntity
        uiTransform={{
            display: isRiddleHintVisible ? 'flex' : 'none',
            width: '50%',
            height: 110,
            positionType: 'absolute',
            position: { top: 180, left: '25%' },
            margin: '0',
            padding: 4,
        }}
    >
        <UiEntity
            uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Label
                value={'HINT: ' + riddleHint}
                fontSize={20}
                uiTransform={{ width: '100%', height: 80 } }
                textAlign='middle-center'
            />
        </UiEntity>
    </UiEntity>
}

function RiddleAnswerInput() {
    return <UiEntity
        uiTransform={{
            display: isRiddleUIVisible ? 'flex' : 'none',
            width: '20%',
            height: 80,
            positionType: 'absolute',
            position: { top: 270, left: '40%' },
            margin: '0',
            padding: 4,
        }}
    >
        <Input
            value={userAnswer}
            onChange={(value) => {
                userAnswer = value.toUpperCase()
                if (!riddleSolved && userAnswer == riddleAnswer.toUpperCase()) {
                    openDoor(riddleId)
                    riddleSolved = true
                }
            }}
            fontSize={20}
            color={Color4.White()}
            uiTransform={{
                width: '100%',
                height: '100%'
            }}
            uiBackground={{
                color: riddleSolved ? Color4.Green() : (userAnswer == '' ? Color4.White() : (userAnswer == riddleAnswer.toUpperCase() ? Color4.Green() : Color4.Red()))
            }}
            disabled={false}
        ></Input>
    </UiEntity>
}

function WinnerText() {
    return <UiEntity
        uiTransform={{
            display: hasWon ? 'flex' : 'none',
            width: '50%',
            height: '20%',
            positionType: 'absolute',
            position: { top: '20%', left: '25%' },
            margin: '0',
            padding: 4,
        }}
        uiBackground={{ color: Color4.fromHexString("#4d544e") }}
    >
        <UiEntity
            uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            uiBackground={{ color: Color4.fromHexString("#4d814e") }}
        >
            <Label
                value='YOU WIN!!'
                fontSize={100}
                uiTransform={{ width: '100%', height: '100%' } }
                textAlign='middle-center'
            />
        </UiEntity>
    </UiEntity>
}

function LoserText() {
    return <UiEntity
        uiTransform={{
            display: hasLost ? 'flex' : 'none',
            width: '50%',
            height: '20%',
            positionType: 'absolute',
            position: { top: '20%', left: '25%' },
            margin: '0',
            padding: 4,
        }}
        uiBackground={{ color: Color4.fromHexString("#4d544e") }}
    >
        <UiEntity
            uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            uiBackground={{ color: Color4.Red() }}
        >
            <Label
                value='YOU LOSE!!'
                fontSize={100}
                uiTransform={{ width: '100%', height: '100%' } }
                textAlign='middle-center'
            />
        </UiEntity>
    </UiEntity>
}

function TimerText() {
    return <UiEntity
        uiTransform={{
            display: 'flex',
            width: '20%',
            height: 110,
            positionType: 'absolute',
            position: { top: 30, left: '40%' },
            margin: '0',
            padding: 4,
        }}
        uiBackground={{ color: Color4.fromHexString("#4d544e") }}
    >
        <UiEntity
            uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            uiBackground={{ color: Color4.Gray() }}
        >
            <Label
                value={Math.floor(secondsLeft).toString()}
                fontSize={80}
                uiTransform={{ width: '100%', height: '100%' } }
                textAlign='middle-center'
            />
        </UiEntity>
    </UiEntity>
}