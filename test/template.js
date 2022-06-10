const template = require('art-template')

const text = '<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>'
const list = [
  '<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>',
  '<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>'
]

const result = template.render(`
{{each list}}{{@$value}}
{{/each}}
`, { list })
console.log(result)