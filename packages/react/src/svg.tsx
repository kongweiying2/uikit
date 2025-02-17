import {
  Subscriptions,
  SvgProperties as BaseSvgProperties,
  createSvg,
  initialize,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { ParentProvider, useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { DefaultProperties } from './default.js'

export type SvgProperties = BaseSvgProperties<R3FEventMap> & {
  children?: ReactNode
  name?: string
}

export type SvgRef = ComponentInternals<BaseSvgProperties<R3FEventMap>>

export const Svg: (props: SvgProperties & RefAttributes<SvgRef>) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createSvg<R3FEventMap>(
        parent,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
      ),
    [parent, propertySignals],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <primitive object={internals.centerGroup} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <DefaultProperties {...internals.defaultProperties}>
          <ParentProvider value={internals}>{properties.children}</ParentProvider>
        </DefaultProperties>
      </object3D>
    </AddHandlers>
  )
})
