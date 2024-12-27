import { useState, useEffect } from 'preact/hooks'
import './app.css'
import { Array1DTracer, Array2DTracer, init2D, delay } from "./defs"
import { useRef } from 'react'

const tracers = {
  tracer: new Array2DTracer('Knapsack Table'),
  valuesTracer: new Array1DTracer('Values'),
  weightsTracer: new Array1DTracer('Weights'),
}


export const App = () => {

  const [playing, setPlaying] = useState(false)
  const timeRef = useRef()
  const [steps, setSteps] = useState([])
  const [indexStep, setIndexStep] = useState(0)
  const [params, setParams] = useState({
    val: [1, 4, 5, 7], // The value of all available items
    wt: [1, 3, 4, 5], // The weights of available items
    W: 7, // The maximum weight we can carry in our collection
  })


  const changeParams = (e) => {
    clearInterval(timeRef.current)
    const strValue = e.target.value
    const name = e.target.name
    // console.log(name, strValue)

    const matches = {
      'val': /^(\d+)(,(\d+))*$/g,
      'wt': /^(\d+)(,(\d+))*$/g,
      'W': /^\d+$/g,
    }

    if (matches[name].test(strValue)) {
      const t = strValue.split(',')
      let value
      value = []
      for (const v of t) {
        value.push(parseInt(v))
      }

      if (name == 'W') {
        value = value[0]
      }


      // console.log(name, value)
      setParams(params => ({ ...params, [name]: value }))
    } else {

    }
  }
  const run = () => {

    const commit = () => {
      let commits = {}
      for (const [k, v] of Object.entries(tracers)) {
        const newStep = v.commit()
        commits[k] = newStep
      }
      setSteps(steps => [...steps, commits])
    }

    setIndexStep(0)
    setSteps([])
    logic(commit, params, tracers)
  }


  useEffect(() => {
    run()
  }, [])

  const play = () => {
    console.log(params)
    run()
    setPlaying(true)
    timeRef.current = setInterval(() => {

      setIndexStep(s => {
        if (s > steps.length - 1) {
          clearInterval(timeRef.current)
          return s
        }
        return s + 1
      })
    }, 500)
  }

  const stop = () => {
    setPlaying(false)
    clearInterval(timeRef.current)
  }

  useEffect(() => {
    setIndexStep(0)
  }, [params])

  const color = {
    0: '',
    1: 'bg-blue-300',
    2: 'bg-[#ED8E93]'
  }


  const currentStep = steps?.[indexStep]
  // console.log("step", currentStep)

  return (
    <div className="box m-4">
      {!!currentStep && <div className='flex flex-col gap-1'>
        {[...Array(currentStep.tracer.values.length + 1)].map((_, i) => {
          if (i == 0) {
            const num = currentStep.tracer.values?.[0]?.length ?? 0
            return <div className='flex gap-1'>
              {[...Array(num + 1)].map((_, i) =>
                <div className={`h-16 w-16 flex items-center justify-center text-2xl`}>
                  {i == 0 ? '' : i - 1}
                </div>
              )}
            </div>
          }
          const row = currentStep.tracer.values[i - 1]
          return <div className='flex gap-1'>
            {[...Array(row.length + 1)].map((_, j) => {
              const cell = row[j - 1]

              if (j == 0) {
                return <div className='h-16 w-16 flex items-center justify-center text-2xl'>
                  {i - 1}
                </div>
              }
              return <div className={`h-16 w-16 flex items-center justify-center max-w-none rounded-lg bg-blue-300/10 text-2xl ${color[currentStep.tracer.selection[i - 1][j - 1]]}`}>{cell}</div>
            })}
          </div>
        })}
      </div>}
      <div className='flex my-4'>
        <button className='px-3 py-2 bg-blue-400 rounded-lg mr-4' onClick={() => playing ? stop() : play()}>{playing ? 'STOP' : 'PLAY'}</button>
        <div className="rounded-tl-lg rounded-bl-lg  cursor-pointer w-10 h-10 bg-blue-400 flex items-center justify-center" onClick={() => setIndexStep(i => i - 1)}>{"<"}</div>
        <div className="w-24 h-10 border-blue-400 border flex items-center justify-center">{`${indexStep} / ${steps.length}`}</div>
        <div className="rounded-tr-lg rounded-br-lg cursor-pointer w-10 h-10 bg-blue-400 flex items-center justify-center" onClick={() => setIndexStep(i => i + 1)}>{">"}</div>
      </div>
      <div className='flex flex-col gap-2 w-64 mt-4'>
        <label>
          values
          <input name="val" onChange={changeParams} className="border-2 rounded-md p-2" type="text" value={params.val} />
        </label>
        <label>
          weight
          <input name="wt" onChange={changeParams} className="border-2 rounded-md p-2" type="text" value={params.wt} />
        </label>
        <label>
          capacity
          <input name="W" onChange={changeParams} className="border-2 rounded-md p-2" type="text" value={params.W} />
        </label>
      </div>

    </div>
  );
}

function logic(commit, params, tracers) {
  // define tracer variables {

  // import visualization libraries {
  // }

  const N = params.val.length
  const DP = init2D(N, params.W)

  // const logger = new LogTracer();
  tracers.tracer.set(DP);
  tracers.valuesTracer.set(params.val);
  tracers.weightsTracer.set(params.wt);
  commit()
  // }

  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= params.W; j++) {
      if (i === 0 || j === 0) {
        /*
        If we have no items or maximum weight we can take in collection is 0
        then the total weight in our collection is 0
        */
        DP[i][0] = 0;
        // visualize {
        tracers.tracer.patch(i, j, DP[i][j]);
        commit()
        tracers.tracer.depatch(i, j);
        // }
      } else if (params.wt[i - 1] <= j) { // take the current item in our collection
        // visualize {
        tracers.weightsTracer.select(i - 1);
        tracers.valuesTracer.select(i - 1);
        commit()
        tracers.tracer.select(i - 1, j - params.wt[i - 1]);
        tracers.tracer.select(i - 1, j);
        commit()
        // }
        const A = params.val[i - 1] + DP[i - 1][j - params.wt[i - 1]];
        const B = DP[i - 1][j];
        /*
        find the maximum of these two values
        and take which gives us a greater weight
         */
        if (A > B) {
          DP[i][j] = A;
          // visualize {
          tracers.tracer.patch(i, j, DP[i][j]);
          commit()
          // }
        } else {
          DP[i][j] = B;
          // visualize {
          tracers.tracer.patch(i, j, DP[i][j]);
          commit()
          // }
        }
        // visualize {
        // opt subproblem depatch
        tracers.tracer.depatch(i, j);
        tracers.tracer.deselect(i - 1, j);
        tracers.tracer.deselect(i - 1, j - params.wt[i - 1]);
        tracers.valuesTracer.deselect(i - 1);
        tracers.weightsTracer.deselect(i - 1);
        // }
      } else { // leave the current item from our collection
        DP[i][j] = DP[i - 1][j];
        // visualize {
        tracers.tracer.patch(i, j, DP[i][j]);
        commit()
        tracers.tracer.depatch(i, j);
        // }
      }
    }
  }

  // logger {
  // logger.println(` Best value we can achieve is ${DP[N][W]}`);
  // }

}