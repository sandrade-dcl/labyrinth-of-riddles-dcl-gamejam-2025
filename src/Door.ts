export interface Door {
    id: number;
    doorEntity: any | null;
    riddleAreaEntity: any | null;
    riddleQuestion: string;
    riddleAnswer: string;
    riddleHint: string;
    doorActions: any;
    isRiddleSolved: boolean;
    isDeadEnd: boolean;
}
