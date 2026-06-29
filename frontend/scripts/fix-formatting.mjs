import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, "..", "src")

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full)
  }
  return files
}

function fixContent(content) {
  let s = content

  // Type / interface boundaries
  s = s.replace(/>(interface|type|export|const|function)/g, ">\n$1")
  s = s.replace(/(Theme)(\s+)(toggle:)/g, "$1;\n  $3")
  s = s.replace(/(boolean)(\s+)(toggle:)/g, "$1;\n  $3")
  s = s.replace(/(Locale)(\s+)(t:)/g, "$1;\n  $3")
  s = s.replace(/(\(key: string\) => string)(\s+)(setLocale:)/g, "$1;\n  $3")
  s = s.replace(/(void)(\})/g, "$1;\n$2")
  s = s.replace(/(\}\)\s*,\s*)(toggle:)/g, "$1\n  $2")

  // Array / block before return
  s = s.replace(/\]\s{2,}return\s*\(/g, "]\n\n  return (")

  // Closing brace before top-level statements
  s = s.replace(/\}\s{2,}(return|export|const|let|if|try|function|throw|localStorage|window\.)/g, "}\n\n$1")

  // forwardRef / component patterns
  s = s.replace(/"button"\s+return/g, '"button"\n    return')
  s = s.replace(/\)\s*\}\)(Input|Button)/g, ")\n  })\n\n$1")

  // Event handler bodies
  s = s.replace(/preventDefault\(\)\s+/g, "preventDefault()\n    ")
  s = s.replace(/return \}\s+/g, "return }\n    ")
  s = s.replace(/setLoading\(true\)\s+/g, "setLoading(true)\n    ")
  s = s.replace(/setError\(""\)\s+/g, 'setError("")\n    ')

  // try/catch/finally
  s = s.replace(/\}\s+catch\s*\(/g, "}\n    catch (")
  s = s.replace(/\}\s+finally\s*\{/g, "}\n    finally {")

  // useState before useEffect
  s = s.replace(/(useState<[^>]+>\([^)]*\))\s{2,}(useEffect)/g, "$1\n\n  $2")

  // useEffect inner statements
  s = s.replace(/(useEffect\(\(\) => \{)\s*(const)/g, "$1\n    $2")
  s = s.replace(/(null)\s+(if \(stored)/g, "$1\n    $2")
  s = s.replace(/(stored\))\s+(setTheme|setLocale)/g, "$1\n    $2")
  s = s.replace(/(\}, \[\])\s+(useEffect)/g, "$1\n\n  $2")
  s = s.replace(/(theme\))\s+(const toggle)/g, "$1\n\n  $2")

  // Function opening brace body
  s = s.replace(/(export default function \w+\(\) \{)\s*(const)/g, "$1\n  $2")
  s = s.replace(/(export function \w+[^{]*\{)\s*(const)/g, "$1\n  $2")

  // try block
  s = s.replace(/(try \{)\s*(const)/g, "$1\n      $2")

  // Statements after successful parse in try
  s = s.replace(/(await res\.json\(\))\s{2,}(localStorage|throw|setSuccess|window)/g, "$1\n      $2")
  s = s.replace(/(JSON\.stringify\(data\))\)\s{2,}(setSuccess|localStorage)/g, "$1)\n      $2")

  // Provider return
  s = s.replace(/(useState\([^)]*\))\s+(return\s*\()/g, "$1\n\n  $2")

  // Split long lines that still have multiple statements
  const lines = s.split("\n")
  const out = []

  for (const line of lines) {
    if (line.length < 180) {
      out.push(line)
      continue
    }

    let fixed = line
    fixed = fixed.replace(/\s{4}(const|let|if|try|return|throw)\s/g, "\n    $1 ")
    fixed = fixed.replace(/\s{6}(const|if|throw|localStorage|setSuccess|setError|setLoading)/g, "\n      $1")
    out.push(...fixed.split("\n"))
  }

  return out.join("\n")
}

let fixedCount = 0
for (const file of walk(srcDir)) {
  const original = fs.readFileSync(file, "utf8")
  const fixed = fixContent(original)
  if (fixed !== original) {
    fs.writeFileSync(file, fixed, "utf8")
    fixedCount++
    console.log("fixed:", path.relative(srcDir, file))
  }
}

console.log(`Done. Updated ${fixedCount} files.`)
