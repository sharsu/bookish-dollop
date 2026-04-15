registerStudyGuide({
  topic: "Geometry",
  icon: "📐",
  summary: "Geometry covers shapes, angles, lines, symmetry and careful diagram reading.",
  intro: "Geometry questions become easier when you spot the rule hidden in the shape or angle diagram.",
  keyIdea: "Use facts you already know to unlock what you do not know yet.",
  visualLabel: "A geometry card showing shape and angle facts.",
  visual: createStudyVisualCard({
    emoji: "📐",
    title: "Shapes and angles",
    subtitle: "Use known facts to find the missing part",
    chips: ["Triangle = 180°", "Line = 180°", "Point = 360°", "Right angle = 90°"],
    accent: "#6366f1"
  }),
  concepts: [
    {
      title: "Shape Properties",
      summary: "Each shape has special features such as sides, angles and symmetry.",
      explanation: [
        "Geometry starts with knowing the properties of common shapes. Triangles, quadrilaterals and regular polygons all have patterns you can learn and use.",
        "When you know the properties, the diagram feels less like a mystery and more like a clue sheet."
      ],
      steps: [
        "Name the shape carefully.",
        "List the facts you know about it.",
        "Use side and angle facts from that shape.",
        "Check that your answer matches the shape."
      ],
      tips: [
        "A square has 4 equal sides and 4 right angles.",
        "An isosceles triangle has 2 equal sides and 2 equal angles.",
        "Regular shapes have equal sides and equal angles."
      ],
      examples: [
        { title: "Square", text: "A square has 4 lines of symmetry." },
        { title: "Isosceles triangle", text: "If one base angle is 50°, the other base angle is also 50°." }
      ],
      visualLabel: "A properties card showing common shape facts.",
      visual: createStudyVisualCard({ emoji: "⬜", title: "Know the shape", subtitle: "Properties help you reason", chips: ["Square", "Rectangle", "Triangle", "Regular"], accent: "#6366f1" })
    },
    {
      title: "Angle Facts",
      summary: "Angle rules help you work out missing angles without guessing.",
      explanation: [
        "Many geometry questions use a small set of very useful angle facts. These include angles on a straight line, angles around a point and angles inside triangles.",
        "If you write the fact before doing the arithmetic, your working stays much clearer."
      ],
      steps: [
        "Find the angle rule that fits the diagram.",
        "Write the total you need, such as 180° or 360°.",
        "Subtract the known angles.",
        "Check the answer is a sensible size."
      ],
      tips: [
        "Angles on a straight line add to 180°.",
        "Angles around a point add to 360°.",
        "Angles in a triangle add to 180°."
      ],
      examples: [
        { title: "Straight line", text: "If one angle is 65° on a straight line, the other is 115°." },
        { title: "Triangle", text: "If two angles in a triangle are 40° and 70°, the third is 70°." }
      ],
      visualLabel: "An angle facts card showing the key totals used in geometry.",
      visual: createStudyVisualCard({ emoji: "📐", title: "Use the angle facts", subtitle: "Write the total first", chips: ["180° line", "360° point", "180° triangle", "Subtract"], accent: "#0ea5e9" })
    },
    {
      title: "Parallel Lines & Special Angles",
      summary: "Parallel lines create matching angle patterns.",
      explanation: [
        "When parallel lines are crossed by another line, some angles match and some add to 180°. Learning the pattern helps you solve tricky diagrams step by step.",
        "The language can sound big at first, but the pictures often repeat the same ideas."
      ],
      steps: [
        "Find the parallel lines mark on the diagram.",
        "Spot matching or co-interior angle pairs.",
        "Use the known angle to work out the missing one.",
        "Check the positions of the angles carefully."
      ],
      tips: [
        "Corresponding angles are equal.",
        "Alternate angles are equal.",
        "Co-interior angles add to 180°."
      ],
      examples: [
        { title: "Corresponding", text: "If one corresponding angle is 55°, the matching angle is also 55°." },
        { title: "Co-interior", text: "If one co-interior angle is 110°, the other is 70°." }
      ],
      visualLabel: "A parallel-lines card showing matching angle relationships.",
      visual: createStudyVisualCard({ emoji: "∥", title: "Parallel lines", subtitle: "Look for the angle pattern", chips: ["Corresponding", "Alternate", "Co-interior", "Match positions"], accent: "#f59e0b" })
    },
    {
      title: "Symmetry, Coordinates & Movement",
      summary: "Geometry also includes reflection, turns and position on a grid.",
      explanation: [
        "Some 11+ geometry questions use symmetry or simple coordinate grids. You might need to reflect a shape, count lines of symmetry or describe a point's position.",
        "Clear drawing helps a lot here because one tiny slip can move a shape into the wrong place."
      ],
      steps: [
        "Read the grid or line of symmetry carefully.",
        "Mark the point or shape neatly.",
        "Count equal spaces when reflecting or translating.",
        "Check the final position matches the instruction."
      ],
      tips: [
        "Coordinates are written as (x, y).",
        "x comes before y.",
        "A reflected shape should be the same distance from the mirror line."
      ],
      examples: [
        { title: "Coordinates", text: "The point (3, 5) is 3 across and 5 up." },
        { title: "Reflection", text: "A point 2 squares left of a mirror line will reflect to 2 squares right of it." }
      ],
      visualLabel: "A geometry movement card showing coordinates and symmetry.",
      visual: createStudyVisualCard({ emoji: "🪞", title: "Move and reflect", subtitle: "Use the grid carefully", chips: ["(x, y)", "Symmetry", "Reflect", "Translate"], accent: "#22c55e" })
    }
  ]
});
