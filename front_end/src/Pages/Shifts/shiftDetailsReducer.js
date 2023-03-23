export const INITIAL_STATE = {
  shiftinstances: [],
  interruptions: [],
  addInterruption: false,
  endshift: false,
};

export const detailsReducer = (state, action) => {
  switch (action.type) {
    case "SET_INSTANCES":
      return {
        ...state,
        shiftinstances: [...action.payload],
      };
    case "SET_INTERRUPTIONS":
      return {
        ...state,
        interruptions: [...action.payload],
      };
    case "TOGGLE_INTERRUPTION_FORM":
      return {
        ...state,
        endShift: false,
        addInterruption: action.payload,
      };
    case "TOGGLE_ENDSHIFT_FORM":
      return {
        ...state,
        addInterruption: false,
        endShift: action.payload,
      };
    case "PUSH_INTERRUPTION":
      return {
        ...state,
        interruptions: [...state.interruptions, action.payload],
      };

    case "END_SHIFT_INSTANCES":
      return {
        ...state,
        shiftinstances: state.shiftinstances.map((instance) => {
          let newInstance = action.payload.find(
            (_instance) => _instance._id === instance._id
          );
          if (newInstance) return { ...newInstance };
          return instance;
        }),
      };

    default:
      return {
        ...state,
      };
  }
};
