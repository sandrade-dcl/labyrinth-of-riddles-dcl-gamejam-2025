export interface Door {
    id: number;
    doorEntity: any | null;
    riddleAreaEntity: any | null;
    riddleQuestion: string;
    riddleAnswer: string;
    doorActions: any;
    isRiddleSolved: boolean;
    isDeadEnd: boolean;
}
