"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Skill = {
  id: string;
  name: string;
  category: string;
};

type SkillSelectorProps = {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
};

export default function SkillSelector({
  selectedSkills,
  onChange,
}: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSkills() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("skills")
        .select("id, name, category")
        .order("category")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setSkills(data ?? []);
      }

      setLoading(false);
    }

    loadSkills();
  }, []);

  function toggleSkill(skillId: string) {
    if (selectedSkills.includes(skillId)) {
      onChange(selectedSkills.filter((id) => id !== skillId));
    } else {
      onChange([...selectedSkills, skillId]);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600">Loading skills...</p>;
  }

  if (error) {
    return (
      <p className="rounded bg-red-100 p-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(new Set(skills.map((skill) => skill.category))).map(
        (category) => (
          <div key={category}>
            <h3 className="mb-3 font-medium">{category}</h3>

            <div className="grid grid-cols-2 gap-3">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <label
                    key={skill.id}
                    className="flex cursor-pointer items-center gap-2 rounded border p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                    />

                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}