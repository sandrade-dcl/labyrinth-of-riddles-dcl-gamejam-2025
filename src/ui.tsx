import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity, Input, Dropdown, Button } from '@dcl/sdk/react-ecs'
import { openDoor, restartGame } from '.'

let riddleId = 0
let isRiddleUIVisible = false
let riddleQuestion = ''
let riddleAnswer = ''
let userAnswer = ''
let riddleSolved = false

export function setupUI() {
    ReactEcsRenderer.setUiRenderer(uiComponent)
}

export function showRiddleUI(id: number, question: string, answer: string) {
    riddleId = id
    isRiddleUIVisible = true
    riddleQuestion = question
    riddleAnswer = answer
    userAnswer = ''
    riddleSolved = false
}

export function hideRiddleUI() {
    isRiddleUIVisible = false
}

const uiComponent = () => (
    [
        RestartButton(),
        RiddleText(),
        RiddleAnswerInput(),
    ]
)

function RiddleText() {
    return <UiEntity
        uiTransform={{
            display: isRiddleUIVisible ? 'flex' : 'none',
            width: '50%',
            height: 100,
            positionType: 'absolute',
            position: { top: '10%', left: '25%' },
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

function RiddleAnswerInput() {
    return <UiEntity
        uiTransform={{
            display: isRiddleUIVisible ? 'flex' : 'none',
            width: '20%',
            height: 80,
            positionType: 'absolute',
            position: { top: '20%', left: '40%' },
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