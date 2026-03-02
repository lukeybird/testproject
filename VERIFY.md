# How to verify float state is stored and displayed correctly

Use these checks to confirm data is stored in Blob and the page shows the latest value.

---

## 1. Check where data is stored

Open your API in the browser (use your real URL if different):

**https://testproject2-roan.vercel.app/api/float**

You should see JSON like:

```json
{
  "state": true,
  "_meta": { "storage": "blob" }
}
```

- **`state`** – Current value (`true`, `false`, or `null` if nothing stored yet).
- **`_meta.storage`** – Where the value comes from:
  - **`"blob"`** – Data is in Vercel Blob (persistent, shared). ✅
  - **`"memory"`** – No Blob token; using in-memory (resets on each request on Vercel). ❌ Fix by adding `BLOB_READ_WRITE_TOKEN` in Vercel env vars.

If you see `"storage": "memory"` in production, add/connect your Blob store and redeploy.

---

## 2. Verify write → read (storage works)

From a terminal (replace the URL if needed):

```bash
# 1) See current value
curl -s https://testproject2-roan.vercel.app/api/float

# 2) Set state to true
curl -s -X POST https://testproject2-roan.vercel.app/api/float \
  -H "Content-Type: application/json" \
  -d '{"state": true}'

# 3) Read again — should show "state": true
curl -s https://testproject2-roan.vercel.app/api/float

# 4) Set state to false
curl -s -X POST https://testproject2-roan.vercel.app/api/float \
  -H "Content-Type: application/json" \
  -d '{"state": false}'

# 5) Read again — should show "state": false
curl -s https://testproject2-roan.vercel.app/api/float
```

If step 3 shows `"state": true` and step 5 shows `"state": false`, the API is storing and returning the last value correctly.

---

## 3. Verify the page shows the last stored value

1. Open the **API** in a browser tab:  
   `https://testproject2-roan.vercel.app/api/float`  
   Note the `state` value (e.g. `false`).

2. Open the **homepage** in another tab:  
   `https://testproject2-roan.vercel.app/`  
   Within about 2 seconds it should show **TRUE** or **FALSE** to match the API’s `state`.  
   If the API had `null`, the page shows **Loading...**.

3. Change the value with curl (e.g. POST `{"state": true}`), then refresh or wait ~2 seconds on the homepage. It should update to **TRUE**.

If the API response and the page text match, the app is storing the data correctly and displaying the last value stored.
