import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { CheckBox } from "@rneui/themed";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Divider, FAB, Icon } from "react-native-paper";
import { useEffect, useState } from "react";
import { ThemedView } from "./ThemedView";

const FITNESS_GOALS = [
  { id: "fat-loss", label: "Fat Loss" },
  { id: "endurance", label: "Endurance" },
  { id: "build-muscle", label: "Build Muscle" },
  { id: "lose-weight", label: "Lose Weight" },
  { id: "improve-balance", label: "Improve Balance" },
  { id: "improve-flexibility", label: "Improve Flexibility" },
  { id: "learn-new-skills", label: "Learn New Skills" },
]
const PARQ_QUESTIONS = [
  {
    id: "heart-condition",
    question: "Has your doctor ever said that you have a heart condition and that you should only perform physical activity recommended by a doctor?"
  },
  {
    id: "chest-pain-activity",
    question: "Do you feel pain in your chest when you perform physical activity?"
  },
  {
    id: "chest-pain-no-activity",
    question: "In the past month, have you had chest pain when you were not performing any physical activity?"
  },
  {
    id: "balance-consciousness",
    question: "Do you lose your balance because of dizziness or do you ever lose consciousness?"
  },
  {
    id: "bone-joint",
    question: "Do you have a bone or joint problem that could be made worse by a change in your physical activity?"
  },
  {
    id: "blood-pressure-meds",
    question: "Is your doctor currently prescribing any medication for your blood pressure or for a heart condition?"
  },
  {
    id: "other-reasons",
    question: "Do you know of any other reason why you should not engage in physical activity?"
  }
];
const GENERAL_HISTORY = {
  occupational: [
    {
      id: "extended-sitting",
      question: "Does your occupation require extended periods of sitting?"
    },
    {
      id: "repetitive-movements",
      question: "Does your occupation require repetitive movements?"
    },
    {
      id: "heel-shoes",
      question: "Does your occupation require you to wear shoes with a heel (e.g., dress shoes)?"
    },
    {
      id: "mental-stress",
      question: "Does your occupation cause you mental stress?"
    }
  ],
  recreational: [
    {
      id: "physical-activities",
      question: "Do you partake in any recreational physical activities (golf, skiing, etc.)?"
    },
    {
      id: "hobbies",
      question: "Do you have any additional hobbies (reading, video games, etc.)?"
    }
  ],
  medical: [
    {
      id: "injuries-pain",
      question: "Have you ever had any injuries or chronic pain?"
    },
    {
      id: "surgeries",
      question: "Have you ever had any surgeries?"
    },
    {
      id: "chronic-disease",
      question: "Has a medical doctor ever diagnosed you with a chronic disease, such as heart disease, hypertension, high cholesterol, or diabetes?"
    },
    {
      id: "medications",
      question: "Are you currently taking any medication?"
    }
  ]
};
const skipExplanationIds = ["extended-sitting", "heel-shoes", "mental-stress"]

interface FitnessSettingsProps {
  fitnessProfile: any;
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
  saveProfile: (profile: any) => void;
}

export default function FitnessSettings({ fitnessProfile, isLoading, isRefetching, refetch, saveProfile }: FitnessSettingsProps) {
  const colorScheme = useColorScheme();
  const [selectedUnit, setSelectedUnit] = useState<"lbs" | "kgs">("lbs");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [parqAnswers, setParqAnswers] = useState<Record<string, boolean>>({});
  const [weights, setWeights] = useState({
    current: "",
    target: "",
  });
  const [historyAnswers, setHistoryAnswers] = useState<Record<string, { answer: boolean; explanation?: string }>>({});
  const [occupation, setOccupation] = useState("");
  const [showParqWarning, setShowParqWarning] = useState(false);

  useEffect(() => {
    const hasYesAnswers = Object.values(parqAnswers).some(answer => answer === true);
    setShowParqWarning(hasYesAnswers);
  }, [parqAnswers]);

  useEffect(() => {
    if (fitnessProfile) {
      const incomingFitnessGoals = Object.entries(fitnessProfile).reduce((result: string[], curr) => {
        let resultArr = result
        const [key, value] = curr
        if (key.includes("goal") && value) {
          const goal = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          resultArr = resultArr.concat(goal)
        }
        return resultArr
      }, [])
      const incomingParQAnswers = Object.entries(fitnessProfile).reduce((result: {[key: string]: boolean;}, curr) => {
        let resultObj = result
        const [key, value] = curr
        if (key.includes("parq")) {
          const parq = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          if (value) {
            resultObj[parq] = true
          } else if (value === false) {
            resultObj[parq] = false
          }
        }
        return resultObj
      }, {})
      const incomingHistoryAnswers = Object.entries(fitnessProfile).reduce((result: {[key: string]: any;}, curr) => {
        let resultObj = result
        const [key, value] = curr
        if (key.includes("explanation")) {
          const historyKey = key.split("_")[2].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          resultObj[historyKey] = {
            ...resultObj[historyKey],
            explanation: value ?? "",
          }
        } else if (key.includes("operational")) {
          const historyKey = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          resultObj[historyKey] = {
            ...resultObj[historyKey],
            answer: value,
          }
        } else if (key.includes("recreational")) {
          const historyKey = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          resultObj[historyKey] = {
            ...resultObj[historyKey],
            answer: value,
          }
        } else if (key.includes("medical")) {
          const historyKey = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          console.log("history key", historyKey, value)
          resultObj[historyKey] = {
            ...resultObj[historyKey],
            answer: value,
          }
        }
        return resultObj
      }, {})
      const incomingUnit = fitnessProfile.unit === "pound" ? "lbs" : "kgs"
      setSelectedGoals(incomingFitnessGoals ?? [])
      setParqAnswers(incomingParQAnswers ?? {})
      setWeights({
        current: `${fitnessProfile.currentWeight}`,
        target: `${fitnessProfile.targetWeight}`,
      })
      setHistoryAnswers(incomingHistoryAnswers ?? {})
      setOccupation(fitnessProfile.operational_occupation ?? "")
      setSelectedUnit(incomingUnit)
    }
  }, [fitnessProfile])

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(current => 
      current.includes(goalId)
        ? current.filter(id => id !== goalId)
        : [...current, goalId]
    );
  };
  const handleHistoryAnswer = (id: string, value: boolean) => {
    setHistoryAnswers(prev => ({
      ...prev,
      [id]: { 
        answer: value, 
        explanation: prev[id]?.explanation || "" 
      }
    }));
  };
  const handleExplanationChange = (id: string, explanation: string) => {
    setHistoryAnswers(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        explanation 
      }
    }));
  };

  if (isLoading) {
    return (
      <ThemedView className='flex-1 relative'>
        <ActivityIndicator />
      </ThemedView>
    )
  }
  // console.log("fitness settings", fitnessProfile, weights)
  return (
    <View className="flex-col gap-y-4 h-full pb-12">
      <Text className='text-gray-400'>Keep your fitness profile up to date</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
      >
        <View className="border rounded-md p-4 mb-2" style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
          <ThemedText type="defaultSemiBold">Weight Goals</ThemedText>
          <Text className='text-gray-400'>Set your current and target weights</Text>
          <View className='flex-row my-1'>
            <CheckBox
              checked={selectedUnit === "lbs"}
              onPress={() => setSelectedUnit("lbs")}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor="#ffd700"
              containerStyle={{ padding: 0, backgroundColor: "none" }}
              title="Pounds (lbs)"
              textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
            />
            <CheckBox
              checked={selectedUnit === "kgs"}
              onPress={() => setSelectedUnit("kgs")}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor="#ffd700"
              containerStyle={{ padding: 0, backgroundColor: "none" }}
              title="Kilograms (kgs)"
              textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
            />
          </View>
          <View className='flex-col'>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Current Weight</ThemedText>
            <TextInput
              style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
              placeholder={`Enter weight in ${selectedUnit}`}
              placeholderTextColor="#78716c"
              defaultValue={fitnessProfile.currentWeight}
              value={weights.current}
              onChangeText={(text) => setWeights(prev => ({ ...prev, current: text }))}
              selectionColor="#fff"
              keyboardType="numeric"
              maxLength={3}
              autoComplete="off"
              // onFocus={() => setIsFocused({
              //   ...isFocused,
              //   first: true,
              // })}
              // onBlur={() => setIsFocused({
              //   ...isFocused,
              //   first: false,
              // })}
            />
          </View>
          <View className='flex-col'>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Target Weight</ThemedText>
            <TextInput
              style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
              placeholder={`Enter weight in ${selectedUnit}`}
              placeholderTextColor="#78716c"
              defaultValue={fitnessProfile.targetWeight}
              value={weights.target}
              onChangeText={(text) => setWeights(prev => ({ ...prev, target: text }))}
              selectionColor="#fff"
              keyboardType="numeric"
              maxLength={3}
              autoComplete="off"
              // onFocus={() => setIsFocused({
              //   ...isFocused,
              //   first: true,
              // })}
              // onBlur={() => setIsFocused({
              //   ...isFocused,
              //   first: false,
              // })}
            />
          </View>
        </View>
        <View className="border rounded-md p-4 my-2" style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
          <ThemedText type="defaultSemiBold">Fitness Goals</ThemedText>
          <Text className='text-gray-400'>Select one or more fitness goals you'd like to achieve</Text>
          <View className='flex-col'>
            {FITNESS_GOALS.map((goal: { id: string; label: string; }) => (
              <CheckBox
                key={goal.id}
                checked={selectedGoals.includes(goal.id)}
                onPress={() => handleGoalToggle(goal.id)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor="#ffd700"
                containerStyle={{ padding: 0, backgroundColor: "none" }}
                title={goal.label}
                textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
              />
            ))}
          </View>
        </View>
        <View className="border rounded-md p-4 my-2" style={{ borderColor: showParqWarning ? "red" : Colors[colorScheme ?? "light"].border }}>
          <ThemedText type="defaultSemiBold">Physical Activity Readiness Questionnaire (PAR-Q)</ThemedText>
          <Text className='text-gray-400'>Please answer the following questions honestly and accurately</Text>
          {showParqWarning ? (
            <View className="border rounded p-2 relative" style={{ borderColor: "red" }}>
              <View className="absolute top-2 right-2">
                <Icon size={16} source="alert-outline" color="red" />
              </View>
              <View className="flex-col gap-y-1">
                <Text className="text-red-600 font-semibold">Medical Consultation Required</Text>
                <Text className="text-red-600">
                  You've answered YES to one or more PAR-Q questions. Please consult your physician
                  before engaging in physical activity. Show your physician which questions you
                  answered YES to and follow their advice on what type of activity is suitable
                  for your current condition.
                </Text>
              </View>
            </View>
          ) : null}
          <View className='flex-col gap-y-4 mt-2'>
            {PARQ_QUESTIONS.map((questionItem: { id: string; question: string; }) => (
              <View className='flex-col' key={questionItem.id}>
                <ThemedText>{questionItem.question}</ThemedText>
                <View className='flex-row'>
                  <CheckBox
                    checked={parqAnswers[questionItem.id] === true}
                    onPress={() => {
                      setParqAnswers(prev => ({
                        ...prev,
                        [questionItem.id]: true
                      }))
                    }}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor="#ffd700"
                    containerStyle={{ padding: 0, backgroundColor: "none" }}
                    title="Yes"
                    textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                  />
                  <CheckBox
                    checked={parqAnswers[questionItem.id] === false}
                    onPress={() => {
                      setParqAnswers(prev => ({
                        ...prev,
                        [questionItem.id]: false
                      }))
                    }}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor="#ffd700"
                    containerStyle={{ padding: 0, backgroundColor: "none" }}
                    title="No"
                    textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="border rounded-md p-4 mt-2" style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
          <ThemedText type="defaultSemiBold">General and Medical History</ThemedText>
          <Text className='text-gray-400'>Please provide information about your occupation, recreational activities and medical history</Text>
          <View className='flex-col gap-y-4 mt-2'>
            <View className='flex-col -mb-3'>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>What is your current occupation?</ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
                placeholder="Enter your current occupation"
                placeholderTextColor="#78716c"
                value={occupation}
                onChangeText={setOccupation}
                selectionColor="#fff"
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="off"
                // onFocus={() => setIsFocused({
                //   ...isFocused,
                //   first: true,
                // })}
                // onBlur={() => setIsFocused({
                //   ...isFocused,
                //   first: false,
                // })}
              />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">Occupational</ThemedText>
              <View className='flex-col gap-y-4 mt-2'>
                {GENERAL_HISTORY.occupational.map((questionItem: { id: string; question: string; }) => (
                  <View className='flex-col' key={questionItem.id}>
                    <ThemedText>{questionItem.question}</ThemedText>
                    <View className='flex-row'>
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === true}
                        onPress={() => handleHistoryAnswer(questionItem.id, true)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="Yes"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === false}
                        onPress={() => handleHistoryAnswer(questionItem.id, false)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="No"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                    </View>
                    {historyAnswers[questionItem.id]?.answer && !skipExplanationIds.includes(questionItem.id) && (
                      <TextInput
                        style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
                        placeholder="Please provide details..."
                        placeholderTextColor="#78716c"
                        value={historyAnswers[questionItem.id]?.explanation}
                        onChangeText={(text) => handleExplanationChange(questionItem.id, text)}
                        selectionColor="#fff"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoComplete="off"
                        multiline
                        // onFocus={() => setIsFocused({
                        //   ...isFocused,
                        //   first: true,
                        // })}
                        // onBlur={() => setIsFocused({
                        //   ...isFocused,
                        //   first: false,
                        // })}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
            <Divider style={{ borderColor: Colors[colorScheme ?? "light"].border, marginVertical: 4 }} />
            <View>
              <ThemedText type="defaultSemiBold">Recreational</ThemedText>
              <View className='flex-col gap-y-4 mt-2'>
                {GENERAL_HISTORY.recreational.map((questionItem: { id: string; question: string; }) => (
                  <View className='flex-col' key={questionItem.id}>
                    <ThemedText>{questionItem.question}</ThemedText>
                    <View className='flex-row'>
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === true}
                        onPress={() => handleHistoryAnswer(questionItem.id, true)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="Yes"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === false}
                        onPress={() => handleHistoryAnswer(questionItem.id, false)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="No"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                    </View>
                    {historyAnswers[questionItem.id]?.answer && !skipExplanationIds.includes(questionItem.id) && (
                      <TextInput
                        style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
                        placeholder="Please provide details..."
                        placeholderTextColor="#78716c"
                        value={historyAnswers[questionItem.id]?.explanation}
                        onChangeText={(text) => handleExplanationChange(questionItem.id, text)}
                        selectionColor="#fff"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoComplete="off"
                        multiline
                        // onFocus={() => setIsFocused({
                        //   ...isFocused,
                        //   first: true,
                        // })}
                        // onBlur={() => setIsFocused({
                        //   ...isFocused,
                        //   first: false,
                        // })}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
            <Divider style={{ borderColor: Colors[colorScheme ?? "light"].border, marginVertical: 4 }} />
            <View>
              <ThemedText type="defaultSemiBold">Medical</ThemedText>
              <View className='flex-col gap-y-4 mt-2'>
                {GENERAL_HISTORY.medical.map((questionItem: { id: string; question: string; }) => (
                  <View className='flex-col' key={questionItem.id}>
                    <ThemedText>{questionItem.question}</ThemedText>
                    <View className='flex-row'>
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === true}
                        onPress={() => handleHistoryAnswer(questionItem.id, true)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="Yes"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                      <CheckBox
                        checked={historyAnswers[questionItem.id]?.answer === false}
                        onPress={() => handleHistoryAnswer(questionItem.id, false)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checkedColor="#ffd700"
                        containerStyle={{ padding: 0, backgroundColor: "none" }}
                        title="No"
                        textStyle={{ color: Colors[colorScheme ?? "light"].text, fontWeight: 500 }}
                      />
                    </View>
                    {historyAnswers[questionItem.id]?.answer && !skipExplanationIds.includes(questionItem.id) && (
                      <TextInput
                        style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
                        placeholder="Please provide details..."
                        placeholderTextColor="#78716c"
                        value={historyAnswers[questionItem.id]?.explanation}
                        onChangeText={(text) => handleExplanationChange(questionItem.id, text)}
                        selectionColor="#fff"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoComplete="off"
                        multiline
                        // onFocus={() => setIsFocused({
                        //   ...isFocused,
                        //   first: true,
                        // })}
                        // onBlur={() => setIsFocused({
                        //   ...isFocused,
                        //   first: false,
                        // })}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <FAB
        label="Save Fitness Profile"
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
          shadowColor: colorScheme === "dark" ? "#fff" : "unset",
        }}
        color="black"
        customSize={40}
        onPress={() => {
          const updatedFitnessProfile = {
            action: "updateUserProfile",
            unit: selectedUnit,
            currentWeight: weights.current,
            targetWeight: weights.target,
            "fat-loss": selectedGoals.includes("fat-loss"),
            endurance: selectedGoals.includes("endurance"),
            "build-muscle": selectedGoals.includes("build-muscle"),
            "lose-weight": selectedGoals.includes("lose-weight"),
            "improve-balance": selectedGoals.includes("improve-balance"),
            "improve-flexibility": selectedGoals.includes("improve-flexibility"),
            "learn-new-skills": selectedGoals.includes("learn-new-skills"),
            "heart-condition": parqAnswers["heart-condition"],
            "chest-pain-activity": parqAnswers["chest-pain-activity"],
            "chest-pain-no-activity": parqAnswers["chest-pain-no-activity"],
            "balance-consciousness": parqAnswers["balance-consciousness"],
            "bone-joint": parqAnswers["bone-joint"],
            "blood-pressure-meds": parqAnswers["blood-pressure-meds"],
            "other-reasons": parqAnswers["other-reasons"],
            occupation,
            "extended-sitting": historyAnswers["extended-sitting"]?.answer,
            "repetitive-movements": historyAnswers["repetitive-movements"]?.answer,
            "explanation_repetitive-movements": historyAnswers["repetitive-movements"]?.explanation,
            "heel-shoes": historyAnswers["heel-shoes"]?.answer,
            "mental-stress": historyAnswers["mental-stress"]?.answer,
            "physical-activities": historyAnswers["physical-activities"]?.answer,
            "explanation_physical-activities": historyAnswers["physical-activities"]?.explanation,
            hobbies: historyAnswers.hobbies?.answer,
            explanation_hobbies: historyAnswers.hobbies?.explanation,
            "injuries-pain": historyAnswers["injuries-pain"]?.answer,
            "explanation_injuries-pain": historyAnswers["injuries-pain"]?.explanation,
            surgeries: historyAnswers.surgeries?.answer,
            explanation_surgeries: historyAnswers.surgeries?.explanation,
            "chronic-disease": historyAnswers["chronic-disease"]?.answer,
            "explanation_chronic-disease": historyAnswers["chronic-disease"]?.explanation,
            medications: historyAnswers.medications?.answer,
            explanation_medications: historyAnswers.medications?.explanation,
          }
          saveProfile.mutate(updatedFitnessProfile)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputFocused: {
    borderColor: '#a16207',
  },
});